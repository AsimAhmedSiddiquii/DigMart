const mongoose = require("mongoose");

const notifySchema = mongoose.Schema({
    sellerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sellers",
        required: true
    },
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
    },
    orderID: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, required: true },
    expireDate: { type: Date, required: true }
});

module.exports = mongoose.model("notifications", notifySchema);