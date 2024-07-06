const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Product = require("../models/Product");
const {
  generrateAccessToken,
    generrateRefreshToken
} = require("../middlewares/jwt");

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Registration successful
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
 *         description: Bad request
 *       500:
 *         description: Server error
 */
// const register = asyncHandler(async (req, res) => {
//   try {
//     const { email, password, firstname, lastname, address , mobile } = req.body;
//     if (!email || !password || !lastname || !firstname || !address || !mobile)
//       return res.status(400).json({
//         success: false,
//         mes: "Missing input",
//       });
//     const user = await User.findOne({ email: email });
//     if (user) throw new Error("User already exists");
//     else {
//       const newUser = await User.create(req.body);
//       return res.status(200).json({
//         success: newUser ? true : false,
//         mes: newUser
//           ? "Registration successful. Go to login"
//           : "Something went wrong",
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       mes: error.message,
//     });
//   }
// });
const register = asyncHandler(async (req, res) => {
  try {
    const { email, password, firstname, lastname, address, mobile } = req.body;
    console.log(req.body);

    if (!email || !password || !lastname || !firstname || !address || !mobile) {
      return res.status(400).json({
        success: false,
        mes: "Missing input",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        mes: "Invalid email format",
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        mes: "User already exists",
      });
    }

    const newUser = await User.create(req.body);
    return res.status(200).json({
      success: !!newUser,
      mes: newUser
        ? "Registration successful. Go to login"
        : "Something went wrong",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      mes: error.message,
    });
  }
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({
      success: false,
      mes: "Missing input",
    });
  const response = await User.findOne({ email: email });
  if (response && (await response.isConrectPassword(password))) {
    // Tách password và role khỏi response
    const { password, role, refreshToken, ...userData } = response.toObject(); // hide 2 truong
    // Tạo access token
    const Accesstoken = generrateAccessToken(response._id, role);
    // Tạo refresh token
    const newrefreshToken = generrateRefreshToken(response._id);
    // Lưu refres token vào database
    await User.findByIdAndUpdate(
      response._id,
      { refreshToken: newrefreshToken },
      { new: true }
    );
    // Lưu refresh token vào cookie
    res.cookie("refreshToken", newrefreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      success: true,
      Accesstoken,
      userData,
    });
  } else {
    throw new Error("Something went wrong pleas login again");
  }
});




/**
 * @swagger
 * /api/cart:
 *   put:
 *     summary: Update the user's cart
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pid:
 *                 type: string
 *                 description: Product ID
 *               quantity:
 *                 type: number
 *                 description: Quantity of the product
 *                 default: 1
 *             required:
 *               - pid
 *     responses:
 *       200:
 *         description: Cart updated successfully
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
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

const updateCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { pid, quantity = 1 } = req.body;
  if (!pid) throw new Error("Missing input");

  const user = await User.findById(_id).select("cart");
  const product = await Product.findById(pid);

  if (!product) {
    return res.status(400).json({
      success: false,
      mes: "Product not found"
    });
  }

  const alreadyProduct = user?.cart?.find(
    (el) => el.product && el.product.toString() === pid
  );

  if (alreadyProduct) {
    const response = await User.updateOne(
      { _id, "cart.product": pid },
      {
        $set: {
          "cart.$.quantity": quantity,
          "cart.$.price": product.price,
          "cart.$.title": product.title,
          "cart.$.thumb": product.thumb,
          "cart.$.color": product.color
        }
      },
      { new: true }
    );
    return res.status(200).json({
      success: response ? true : false,
      mes: response ? "Updated your cart" : "Something went wrong"
    });
  } else {
    const response = await User.findByIdAndUpdate(
      _id,
      {
        $push: {
          cart: {
            product: pid,
            quantity,
            price: product.price,
            title: product.title,
            thumb: product.thumb,
            color: product.color
          }
        }
      },
      { new: true }
    );
    return res.status(200).json({
      success: response ? true : false,
      mes: response ? "Updated your cart" : "Something went wrong"
    });
  }
});

module.exports = {
  register,
  login,
  updateCart
};
