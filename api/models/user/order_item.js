const mongoose = require("mongoose");

const itemSchema = mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
    orderID: { type: String, required: true, ref: 'orders' },
    sellerID: { type: mongoose.Schema.Types.ObjectId, ref: 'sellers', required: true },
    variantID: { type: mongoose.Schema.Types.ObjectId, ref: 'variants' },
    productID: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
    size: { type: String },
    colour: { type: String },
    quantity: { type: String, required: true },
    sellingPrice: { type: Number, required: true },
    date: { type: String, required: true },
    deliveryDate: { type: String, required: true },
    status: { type: String, required: true },
    delOTP: { type: String, default: '0000' }
})

module.exports = mongoose.model('order_items', itemSchema);