const express = require('express');
const router = express.Router();
const {verifyToken , isAdmin} = require('../middlewares/verifyToken')
const productsController = require('../controllers/productController');
const uploader = require('../Config/cloudinary.cofig')

router.get('/', productsController.getallproducts);
router.post('/',[verifyToken, isAdmin], productsController.createproducts)
router.delete('/:pid',[verifyToken, isAdmin], productsController.deleteProduct)
router.put('/:pid',[verifyToken, isAdmin], productsController.updateProduct)

module.exports = router;
