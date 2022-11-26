const express = require("express")
const router = express.Router()

const OrderItem = require('../../models/user/order_item');

const checkAuth = require('../../middleware/user/checkAuth');
const useLocals = require("../../middleware/user/useLocals")

router.get('/', [checkAuth, useLocals], async(req, res) => {
    var docs = await OrderItem.find({ userID: req.session.userID }).sort({ orderID: -1 }).populate('sellerID productID variantID').exec()
    res.render('./user/account/orders', { orderItemsData: docs, userName: req.session.userName })
})

module.exports = router