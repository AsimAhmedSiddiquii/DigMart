const express = require("express")
const router = express.Router()

const Variants = require('../../models/seller/variants');
const Products = require("../../models/seller/product");
const Review = require("../../models/user/reviews");

router.get('/view-product/(:id)', async(req, res) => {
    var slugid = req.params.id;
    var element = await Products.findOne({ slugID: slugid })
    await Products.updateOne({ _id: element._id }, { $inc: { "views": 1 } })
    var docs = await Variants.find({ prodID: element._id })
    var review = await Review.find({ productID: element._id }).sort({ "rating": -1 }).populate('userID')
    if (review.length != 0) {
        var rat1 = await Review.find({ rating: '1', productID: element._id })
        var rat2 = await Review.find({ rating: '2', productID: element._id })
        var rat3 = await Review.find({ rating: '3', productID: element._id })
        var rat4 = await Review.find({ rating: '4', productID: element._id })
        var rat5 = await Review.find({ rating: '5', productID: element._id })
        var total = review.length;
        var response = (1 * (rat1.length)) + (2 * (rat2.length)) + (3 * (rat3.length)) + (4 * (rat4.length)) + (5 * (rat5.length))
        var rating = response / total;
    } else {
        var rating = 0
    }
    res.render('./user/product', { totalrating: response, rating: rating.toFixed(1), reviewData: review, variantData: docs[0], variantsData: docs, productData: element, user: req.session.userID });
})

router.get('/variant/(:variantslugID)', async(req, res) => {
    var varelement = await Variants.findOne({ slugID: req.params.variantslugID });
    var element = await Products.findOne({ _id: varelement.prodID })
    await Products.updateOne({ _id: element._id }, { $inc: { "views": 1 } })
    var vd = await Variants.find({ prodID: varelement.prodID })

    var similarProds = []
    var filteredProds = await Variants.find({ '_id': { $ne: varelement._id } }).populate('prodID')
    for (let i = 0; i < filteredProds.length && similarProds.length <= 10; i++) {
        if (filteredProds[i].prodID) {
            if (filteredProds[i].prodID.category.equals(element.category) && filteredProds[i].prodID.subcategory.equals(element.subcategory)) {
                similarProds.push(filteredProds[i])
            }
        }
    }

    var review = await Review.find({ productID: varelement.prodID }).sort({ "rating": -1 }).populate('userID')
    if (review.length != 0) {
        var rat1 = await Review.find({ rating: '1', productID: varelement.prodID })
        var rat2 = await Review.find({ rating: '2', productID: varelement.prodID })
        var rat3 = await Review.find({ rating: '3', productID: varelement.prodID })
        var rat4 = await Review.find({ rating: '4', productID: varelement.prodID })
        var rat5 = await Review.find({ rating: '5', productID: varelement.prodID })
        var total = review.length;
        var response = (1 * (rat1.length)) + (2 * (rat2.length)) + (3 * (rat3.length)) + (4 * (rat4.length)) + (5 * (rat5.length))
        var rating = response / total;
    } else {
        var rating = 0
    }
    res.render('./user/product', { similarProds, totalrating: response, rating: rating.toFixed(1), reviewData: review, variantData: varelement, variantsData: vd, productData: element, user: req.session.userID });
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