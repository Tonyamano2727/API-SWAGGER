const express = require('express');
const router = express.Router();
const {verifyToken , isAdmin} = require('../middlewares/verifyToken')
const productsController = require('../controllers/productController');
const uploader = require('../Config/cloudinary.cofig')

router.get('/', productsController.getallproducts);
router.post('/',[verifyToken, isAdmin],uploader.fields([{name : 'images' , maxCount:10},{name: 'thumb' , maxCount:1}]), productsController.createproducts)

module.exports = router;
