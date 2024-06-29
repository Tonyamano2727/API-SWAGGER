const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const verifyToken = asyncHandler(async (req, res, next) => {
  // Bearer token
  // headers: {authorization : Bearer token}

  if (req?.headers?.authorization?.startsWith("Bearer")) {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err)
        return res.status(401).json({
          success: true,
          mes: "Invalid access token",
        });
      req.user = decode;
      next();
    });
  } else {
    return res.status(401).json({
      success: false,
      mes: "Require authorization",
    });
  }
});

// phan quyen admin
const isAdmin = asyncHandler(async (req, res, next) => {
  const { role } = req.user;
  if (+role !== 1945)
    return res.status(401).json({
      success: false,
      mes: "Require admin role",
    });
  next();
});

module.exports = {
  verifyToken,
  isAdmin,
};
