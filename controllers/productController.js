const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Retrieve a list of products
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Title of the product
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category of the product
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *         description: Color of the product
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for title, category, brand, or color
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Fields to sort by
 *       - in: query
 *         name: price[lt]
 *         schema:
 *           type: number
 *         description: Sort 
 *       - in: query
 *         name: price[gt]
 *         schema:
 *           type: number
 *         description: Sort price
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: Fields to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           
 *           description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           
 *           description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 counts:
 *                   type: integer
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
const getallproducts = asyncHandler(async (req, res) => {
  const queries = { ...req.query };
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((el) => delete queries[el]);

  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, (matchedEl) => `$${matchedEl}`);
  const formattedQueries = JSON.parse(queryString);
  let colorQueryObject = {};

  if (queries?.title) formattedQueries.title = { $regex: queries.title, $options: "i" };
  if (queries?.category) formattedQueries.category = { $regex: queries.category, $options: "i" };
  if (queries?.color) {
    delete formattedQueries.color;
    const colorArr = queries.color?.split(',');
    const colorQuery = colorArr.map((el) => ({ color: { $regex: el, $options: 'i' } }));
    colorQueryObject = { $or: colorQuery };
  }
  let queryObject = {};
  if (queries?.q) {
    delete formattedQueries.q;
    queryObject = {
      $or: [
        { color: { $regex: queries.q, $options: 'i' } },
        { title: { $regex: queries.q, $options: 'i' } },
        { category: { $regex: queries.q, $options: 'i' } },
        { brand: { $regex: queries.q, $options: 'i' } },
      ],
    };
  }


  const qr = { ...colorQueryObject, ...formattedQueries, ...queryObject };
  let queryCommand = Product.find(qr);

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    queryCommand = queryCommand.sort(sortBy);
  }

  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    queryCommand = queryCommand.select(fields);
  }

  const page = +req.query.page || 1;
  const limit = +req.query.limit || process.env.LIMIT_PRODUCTS;
  const skip = (page - 1) * limit;
  queryCommand.skip(skip).limit(limit);

  try {
    const response = await queryCommand.exec();
    const counts = await Product.find(qr).countDocuments();
    return res.status(200).json({
      success: response ? true : false,
      counts,
      products: response ? response : "Cannot get product",
    });
  } catch (err) {
    throw new Error(err.message);
  }
});


/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - name: title
 *         in: formData
 *         description: Title of the product
 *         required: true
 *         type: string
 *       - name: price
 *         in: formData
 *         description: Price of the product
 *         required: true
 *         type: number
 *         format: double
 *       - name: description
 *         in: formData
 *         description: Description of the product
 *         required: true
 *         type: string
 *       - name: brand
 *         in: formData
 *         description: Brand of the product
 *         required: true
 *         type: string
 *       - name: category
 *         in: formData
 *         description: Category of the product
 *         required: true
 *         type: string
 *       - name: color
 *         in: formData
 *         description: Color of the product
 *         required: true
 *         type: string
 *       - name: thumb
 *         in: formData
 *         description: Thumbnail image of the product
 *         required: false
 *         type: file
 *       - name: images
 *         in: formData
 *         description: Additional images of the product
 *         required: false
 *         type: array
 *         items:
 *           type: file
 *     responses:
 *       200:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 mes:
 *                   type: string
 *       400:
 *         description: Missing input
 *       500:
 *         description: Internal server error
 */
const createproducts = asyncHandler(async (req, res) => {
  const { title, price, description, brand, category, color } = req.body;
  const thumb = req?.files?.thumb[0]?.path;
  const images = req.files?.images?.map(el => el.path);

  if (!(title && price && description && brand && category && color)) throw new Error("Missing input");
  req.body.slug = slugify(title);
  if (thumb) req.body.thumb = thumb;
  if (images) req.body.images = images;
  const newproducts = await Product.create(req.body);
  return res.status(200).json({
    success: newproducts ? true : false,
    mes: newproducts ? 'Product has been created' : "Failed to create product",
  });
});


module.exports = {
  getallproducts,
  createproducts
};
