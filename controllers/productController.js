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
 *           default: 1
 *           description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
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

module.exports = {
  getallproducts,
};
