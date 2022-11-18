const mongoose = require("mongoose");

const adsSchema = mongoose.Schema({
    orderID: { type: String, required: true },
    sellerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sellers',
        required: true
    },
    productID: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
    expireDate: { type: Date, required: true },
    paymentDone: { type: Boolean, default: false },
});

module.exports = mongoose.model("ads", adsSchema);