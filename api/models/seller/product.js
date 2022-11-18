const mongoose = require("mongoose");

const specificationsSchema = new mongoose.Schema({
    specName: { type: String },
    specValue: { type: String },
});

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    slugID: { type: String, required: false },
    sellerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sellers'
    },
    variantIDArr: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'variants'
    }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'subcategory', required: true },
    images: [{ type: String }],
    productName: { type: String, required: true },
    description: { type: String },
    brand: { type: String },
    quantity: { type: Number },
    specifications: [specificationsSchema],
    actualPrice: { type: String },
    discount: { type: Number },
    finalPrice: { type: String },
    hasVariant: { type: Boolean, default: true },
    status: { type: String, default: "Incomplete : Variants Not Added" },
    views: { type: Number, default: 0 },
    out_of_stock: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
});

module.exports = mongoose.model("products", productSchema);