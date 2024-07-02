const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productController');

router.get('/', productsController.getallproducts);

module.exports = router;
