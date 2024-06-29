// controllers/userController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const {
  generrateAccessToken,
  generrateRefreshToken,
} = require("../middlewares/jwt");

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
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
const register = asyncHandler(async (req, res) => {
  try {
    const { email, password, firstname, lastname, address , mobile } = req.body;
    if (!email || !password || !lastname || !firstname || !address || !mobile)
      return res.status(400).json({
        success: false,
        mes: "Missing input",
      });
    const user = await User.findOne({ email: email });
    if (user) throw new Error("User already exists");
    else {
      const newUser = await User.create(req.body);
      return res.status(200).json({
        success: newUser ? true : false,
        mes: newUser
          ? "Registration successful. Go to login"
          : "Something went wrong",
      });
    }
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
    throw new Error("Invalid credentials");
  }
});

module.exports = {
  register,
  login
};
