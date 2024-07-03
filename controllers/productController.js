const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const slugify = require("slugify");
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Retrieve a list of products
 *     tags: [Products] 
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
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (matchedEl) => `$${matchedEl}`
  );
  const formattedQueries = JSON.parse(queryString);
  let colorQueryObject = {};

  if (queries?.title)
    formattedQueries.title = { $regex: queries.title, $options: "i" };
  if (queries?.category)
    formattedQueries.category = { $regex: queries.category, $options: "i" };
  if (queries?.color) {
    delete formattedQueries.color;
    const colorArr = queries.color?.split(",");
    const colorQuery = colorArr.map((el) => ({
      color: { $regex: el, $options: "i" },
    }));
    colorQueryObject = { $or: colorQuery };
  }
  let queryObject = {};
  if (queries?.q) {
    delete formattedQueries.q;
    queryObject = {
      $or: [
        { color: { $regex: queries.q, $options: "i" } },
        { title: { $regex: queries.q, $options: "i" } },
        { category: { $regex: queries.q, $options: "i" } },
        { brand: { $regex: queries.q, $options: "i" } },
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
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products] 
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */

const createproducts = async (req, res) => {
  try {
    const productData = req.body;

    // Validate that required fields are present
    if (!productData.title || !productData.slug || !productData.description || !productData.brand || !productData.price || !productData.category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * /api/products/{pid}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to delete
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Delete successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 mes:
 *                   type: string
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  try {
    const deleteProduct = await Product.findByIdAndDelete(pid);
    if (!deleteProduct) {
      return res.status(404).json({
        success: false,
        mes: 'Product not found',
      });
    }
    return res.status(200).json({
      success: true,
      mes: 'Deleted',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      mes: 'Cannot delete product',
    });
  }
});



/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
/**
 * @swagger
 * /api/products/{pid}:
 *   put:
 *     summary: Update a product by ID
 *     tags: [Products] 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to update
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *               description: New title for the product
 *     responses:
 *       '200':
 *         description: A successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 mes:
 *                   type: string
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  try {
    if (req.body && req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        mes: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      mes: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      mes: 'Internal Server Error',
    });
  }
});


module.exports = {
  getallproducts,
  createproducts,
  deleteProduct,
  updateProduct
};
