const express = require("express")
const router = express.Router()
const https = require('https')

const Category = require('../../models/admin/categorySchema')
const SubCategory = require('../../models/admin/subcategory')

const Seller = require("../../models/seller/seller")
const Coverage = require("../../models/seller/coverage")
const Ads = require("../../models/seller/ads")
const Products = require('../../models/seller/product')
const Variants = require('../../models/seller/variants')

router.get('/', async(req, res) => {
    var varDocs = []
    var catData = await Category.find()
    var selData = await Seller.find({ featured: true, status: 'Verified' }).populate('busCat')
    var promotedProducts = await Ads.find({ expireDate: { $gte: new Date() } }).populate('productID sellerID')

    promotedProducts.sort(() => Math.random() - 0.5);

    for (let i = 0; i < promotedProducts.length; i++) {
        if (promotedProducts[i].productID.hasVariant) {
            var doc = await Variants.find({ prodID: promotedProducts[i].productID._id })
            varDocs.push(doc[0])
        }
    }
    res.render('./user/home', { promotedProducts, catData, selData, varDocs, user: req.session.userID })
})

router.get('/shop-by-category', async(req, res) => {
    var varDocs = []

    var catDocs = await Category.findOne({ catName: req.query.cat })
    var subcatDocs = await SubCategory.find({ catID: catDocs._id })

    if (req.session.pincode) {
        var covDocs = await Coverage.find({ pin: { pincode: req.session.pincode } }).select('sellerID')
        var selArr = []
        for (let i = 0; i < covDocs.length; i++)
            selArr.push(covDocs[i].sellerID)
        var proDocs = await Products.find({ category: catDocs._id, sellerID: { $in: selArr }, status: 'Verified' })
    } else {
        var proDocs = await Products.find({ category: catDocs._id, status: 'Verified' })
    }

    if (catDocs.variant == 'Available') {
        for (let i = 0; i < proDocs.length; i++) {
            var doc = await Variants.find({ prodID: proDocs[i]._id })
            varDocs.push(doc[0])
        }
    }
    res.render('./user/shop-by-category', { catDocs: catDocs, subcatDocs, proDocs: proDocs, varDocs: varDocs, user: req.session.userID })
})

router.post('/api/pincode', (req, res) => {
    var lat = req.body.lat
    var long = req.body.long

    https.get('https://api.opencagedata.com/geocode/v1/json?q=' + lat + '+' + long + '&key=' + process.env.OPENCAGE_API, response => {
        let data = [];

        response.on('data', chunk => {
            data.push(chunk);
        });

        response.on('end', () => {
            const val = JSON.parse(Buffer.concat(data).toString());
            req.session.pincode = val.results[0].components.postcode
            console.log('pc = ' + req.session.pincode)
            res.json({
                pincode: val.results[0].components.postcode
            });
        });
    }).on('error', err => {
        console.log('Error: ', err.message);
        res.json({
            pincode: 'error'
        });
    });
})

router.post('/search', async(req, res) => {
    let payload = req.body.payload.trim()
    let products = await Products.find({ productName: { $regex: new RegExp('^' + payload + '.*', 'i') }, status: 'Verified' }).populate('category').select('_id slugID productName category')

    const isEqual = (first, second) => {
        return JSON.stringify(first) === JSON.stringify(second);
    }

    var prod = []
    products = products.filter((product) => {
        console.log(product)
        if (!prod.some(e => isEqual(e, {
                productName: product.productName,
                category: product.category.catName
            }))) {
            prod.push({ productName: product.productName, category: product.category })
            return product
        }
    })
    products = products.slice(0, 7)

    let sellers = await Seller.find({ busName: { $regex: new RegExp('^' + payload + '.*', 'i') }, status: 'Verified' }).select('_id slugID busName')
    sellers = sellers.slice(0, 3)
    res.json({
        products: products,
        sellers: sellers
    })
})

router.post('/search-results', async(req, res) => {
    var varDocs = []
    let payload = req.body.payload.trim()
    if (req.session.pincode) {
        var covDocs = await Coverage.find({ pin: { pincode: req.session.pincode } }).select('sellerID')
        var selArr = []
        for (let i = 0; i < covDocs.length; i++)
            selArr.push(covDocs[i].sellerID)
        var proDocs = await Products.find({ productName: { $regex: new RegExp('^' + payload + '.*', 'i') }, sellerID: { $in: selArr }, status: 'Verified' })
        var selDoc1 = await Seller.find({ busName: { $regex: new RegExp('^' + payload + '.*', 'i') }, sellerID: { $in: selArr }, status: 'Verified', featured: true }).populate('busCat')
        var selDoc2 = await Seller.find({ busName: { $regex: new RegExp('^' + payload + '.*', 'i') }, sellerID: { $in: selArr }, status: 'Verified', featured: false }).populate('busCat')
    } else {
        var proDocs = await Products.find({ productName: { $regex: new RegExp('^' + payload + '.*', 'i') }, status: 'Verified' })
        var selDoc1 = await Seller.find({ busName: { $regex: new RegExp('^' + payload + '.*', 'i') }, status: 'Verified', featured: true }).populate('busCat')
        var selDoc2 = await Seller.find({ busName: { $regex: new RegExp('^' + payload + '.*', 'i') }, status: 'Verified', featured: false }).populate('busCat')
    }
    var selDocs = selDoc1.concat(selDoc2)
    for (let i = 0; i < proDocs.length; i++) {
        var doc = await Variants.find({ prodID: proDocs[i]._id })
        varDocs.push(doc[0])
    }
    res.render('./user/search-results', { payload: payload, selDocs: selDocs, proDocs: proDocs, varDocs: varDocs, user: req.session.userID })
})

module.exports = router