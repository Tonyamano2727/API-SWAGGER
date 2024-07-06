const Order = require("../models/Order");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 rs:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product:
 *                             type: string
 *                           quantity:
 *                             type: number
 *                           color:
 *                             type: string
 *                           price:
 *                             type: number
 *                           title:
 *                             type: string
 *                           thumb:
 *                             type: string
 *                     status:
 *                       type: string
 *                     total:
 *                       type: number
 *                     orderBy:
 *                       type: string
 *                     address:
 *                       type: string
 *       '400':
 *         description: Cart is empty
 *       '500':
 *         description: Internal server error
 */

const createOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { address, status } = req.body;
  
    // Lấy thông tin người dùng từ cơ sở dữ liệu, bao gồm giỏ hàng
    const user = await User.findById(_id).populate('cart.product');
    if (!user || !user.cart.length) {
      return res.status(400).json({ success: false, mes: 'Cart is empty' });
    }
  
    // Tạo dữ liệu đơn hàng từ giỏ hàng của người dùng
    const products = user.cart.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      color: item.color,
      price: item.product.price,
      title: item.product.title,
      thumb: item.product.thumb
    }));
  
    const total = products.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Tạo đối tượng đơn hàng mới
    const data = { products, total, orderBy: _id, address };
    if (status) data.status = status;
  
    // Lưu đơn hàng vào cơ sở dữ liệu
    const rs = await Order.create(data);
  
    // Xóa giỏ hàng của người dùng sau khi tạo đơn hàng thành công
    user.cart = [];
    await user.save();
  
    // Trả về kết quả
    return res.status(200).json({
      success: true,
      rs: rs,
    });
});

  





module.exports = {
  createOrder,
};
