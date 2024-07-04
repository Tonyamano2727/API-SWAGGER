// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {verifyToken} = require('../middlewares/verifyToken')

router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/cart',[verifyToken], userController.updateCart);


module.exports = router;
