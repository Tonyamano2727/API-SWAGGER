const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');
const {verifyToken} = require('../middlewares/verifyToken')

router.post('/',[verifyToken] , ctrl.createOrder);


module.exports = router;
