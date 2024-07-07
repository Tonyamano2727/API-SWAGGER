const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/verifyToken');

// Cấu hình multer
const upload = multer();


router.post('/register', upload.none(), userController.register);
router.post('/login',upload.none(),userController.login);
router.put('/cart',upload.none(), verifyToken, userController.updateCart);

module.exports = router;
