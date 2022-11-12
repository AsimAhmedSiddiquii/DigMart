const express = require("express");
const router = express.Router();
require("firebase/storage");

const Category = require('../../models/admin/categorySchema')
const Subcategory = require('../../models/admin/subcategory')
const Subscribe = require('../../models/user/subscribe')

const Seller = require("../../models/seller/seller");
const SellerGall = require("../../models/seller/gallery");
const Products = require('../../models/seller/product')
const Variants = require('../../models/seller/variants')

const SellerProfileViews = require('../../models/user/views/sellerProfileView')

router.get("/(:sellerslugID)", async(req, res, next) => {
    var id = req.params.sellerslugID;
    const seller = await Seller.findOne({ slugID: id }).exec();
    const images = await SellerGall.findOne({ sellerID: seller._id }).select("images");
    var subscribed = false;

    if (req.session.userID) {
        const profileView = new SellerProfileViews({
            userID: req.session.userID,
            sellerID: seller._id,
            timestamp: new Date()
        })
        await profileView.save()
        const check = await Subscribe.find({ userID: req.session.userID, sellerID: seller._id })
        subscribed = check == 0 ? false : true
    }

    var varDocs = []
    var filteredCatData = []
    var catDocs = await Category.find()
    var proDocs = await Products.find({ sellerID: seller._id, status: 'Verified' }).populate('category subcategory')

    const uniqueCatDocs = [...new Set(proDocs.map(item => item.category.catName))];

    for (let i = 0; i < catDocs.length; i++) {
        if (uniqueCatDocs.includes(catDocs[i].catName)) {
            const subcats = await Subcategory.find({ catID: catDocs[i]._id })
            const map = {
                category: catDocs[i],
                subcat: subcats
            }
            filteredCatData[i] = map
        }
    }

    for (let i = 0; i < proDocs.length; i++) {
        if (proDocs[i].hasVariant) {
            var doc = await Variants.find({ prodID: proDocs[i]._id })
            varDocs.push(doc[0])
        }
    }

    res.render("./user/seller-profile", {
        galleryData: images,
        sellerID: id,
        sellerData: seller,
        catData: filteredCatData,
        user: req.session.userID,
        proDocs: proDocs,
        varDocs: varDocs,
        subscribed
    });
});
module.exports = router;