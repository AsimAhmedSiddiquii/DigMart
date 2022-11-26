const express = require("express")
const router = express.Router()

const Variants = require('../../models/seller/variants');
const Products = require("../../models/seller/product");
const Review = require("../../models/user/reviews");
const Ads = require('../../models/seller/ads')

const useLocals = require("../../middleware/user/useLocals")

router.get('/view-product/(:id)', async(req, res) => {
    var slugid = req.params.id;
    var productData = await Products.findOne({ slugID: slugid })
    await Products.updateOne({ _id: productData._id }, { $inc: { "views": 1 } })

    var docs = await Variants.find({ prodID: productData._id })
    var reviewData = await Review.find({ productID: productData._id }).sort({ "rating": -1 }).populate('userID')
    if (reviewData.length != 0) {
        var rat1 = await Review.find({ rating: '1', productID: productData._id })
        var rat2 = await Review.find({ rating: '2', productID: productData._id })
        var rat3 = await Review.find({ rating: '3', productID: productData._id })
        var rat4 = await Review.find({ rating: '4', productID: productData._id })
        var rat5 = await Review.find({ rating: '5', productID: productData._id })
        var total = reviewData.length;
        var response = (1 * (rat1.length)) + (2 * (rat2.length)) + (3 * (rat3.length)) + (4 * (rat4.length)) + (5 * (rat5.length))
        var rating = response / total;
    } else {
        var rating = 0
    }

    var similarProds = await Products.find({ category: productData.category, subcategory: productData.subcategory }).limit(10)
    res.render('./user/product', { totalrating: response, rating: rating.toFixed(1), reviewData, variantData: docs[0], variantsData: docs, productData, similarProds });
})

router.get('/variant/(:variantslugID)', useLocals, async(req, res) => {
    var variantData = await Variants.findOne({ slugID: req.params.variantslugID });
    var productData = await Products.findOne({ _id: variantData.prodID })
    await Products.updateOne({ _id: productData._id }, { $inc: { "views": 1 } })
    var variantsData = await Variants.find({ prodID: variantData.prodID })

    // Similar Products
    var similarProds = []
    var filteredProds = await Variants.find({ '_id': { $ne: variantData._id } }).populate('prodID')
    for (let i = 0; i < filteredProds.length && similarProds.length < 8; i++) {
        if (filteredProds[i].prodID) {
            if (filteredProds[i].prodID.category.equals(productData.category) && filteredProds[i].prodID.subcategory.equals(productData.subcategory)) {
                similarProds.push(filteredProds[i])
            }
        }
    }

    // Product Review
    var reviewData = await Review.find({ productID: variantData.prodID }).sort({ "rating": -1 }).populate('userID')
    if (reviewData.length != 0) {
        var rat1 = await Review.find({ rating: '1', productID: variantData.prodID })
        var rat2 = await Review.find({ rating: '2', productID: variantData.prodID })
        var rat3 = await Review.find({ rating: '3', productID: variantData.prodID })
        var rat4 = await Review.find({ rating: '4', productID: variantData.prodID })
        var rat5 = await Review.find({ rating: '5', productID: variantData.prodID })
        var total = reviewData.length;
        var response = (1 * (rat1.length)) + (2 * (rat2.length)) + (3 * (rat3.length)) + (4 * (rat4.length)) + (5 * (rat5.length))
        var rating = response / total;
    } else {
        var rating = 0
    }

    // Ads
    var varDocs = []
    var promotedProducts = await Ads.find({ expireDate: { $gte: new Date() } }).populate('productID sellerID').limit(4)
    promotedProducts.sort(() => Math.random() - 0.5);

    for (let i = 0; i < promotedProducts.length; i++) {
        if (promotedProducts[i].productID.hasVariant) {
            var doc = await Variants.find({ prodID: promotedProducts[i].productID._id })
            varDocs.push(doc[0])
        }
    }

    res.render('./user/product', { promotedProducts, varDocs, similarProds, totalrating: response, rating: rating.toFixed(1), reviewData, variantData, variantsData, productData });
})

router.get('/findsize/(:id)/(:size)', async(req, res) => {
    var id = req.params.id;
    var doc = await Variants.findOne({ _id: id })
    for (let i = 0; i < doc.sizes.length; i++) {
        if (doc.sizes[i].sizes == req.params.size) {
            res.send(doc.sizes[i])
        }
    }
})

module.exports = router