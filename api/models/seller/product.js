const mongoose = require("mongoose");

const specificationsSchema = new mongoose.Schema({
    specName: { type: String },
    specValue:  { type: String },
});

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    sellerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sellers'
    },
    variantIDArr: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'variants'
    }],
    category: { type: String, required: true },
    subcategory: { type: String},
    images: [{type: String}],
    productName: { type: String, required: true },
    description: { type: String},
    brand: { type: String},
    quantity:  { type: Number},
    specifications: [specificationsSchema],
    actualPrice:  { type: String},
    discount: { type: Number},
    finalPrice:  { type: String},
    hasVariant: { type: Boolean, default: true},
    featured: { type: Boolean, default: false},
    wishlisted: { type: Boolean},
    status:  { type: String, default: "Incomplete : Variants Not Added"},
});

module.exports = mongoose.model("products", productSchema);