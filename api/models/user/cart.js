const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    sellerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sellers',
        required: true
    },
    variantID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'variants',
    },
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true
    },
    size: { type: String },
    colour: { type: String },
    quantity: { type: String, required: true }
})

const Cart = new mongoose.model("cart", cartSchema)
module.exports = Cart;