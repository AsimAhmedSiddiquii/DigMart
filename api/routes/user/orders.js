const express = require("express")
const router = express.Router()

const OrderItem = require('../../models/user/order_item');

const CheckAuth = require('../../middleware/user/checkAuth');

router.get('/', CheckAuth, async(req, res) => {
    var docs = await OrderItem.find({ userID: req.session.userID }).sort({ orderID: -1 }).populate('sellerID productID variantID').exec()
    res.render('./user/orders', { orderItemsData: docs, user: req.session.userID, userName: req.session.userName })
})

module.exports = router