const express = require("express")
const router = express.Router()

const Products = require("../../models/seller/product")
const Seller = require('../../models/seller/seller');
const Variants = require('../../models/seller/variants');
const checkAuth = require("../../middleware/admin/checkAuth")
const Gallery = require('../../models/seller/gallery');

router.get('/product', checkAuth, async(req, res) => {
    prodID = [];
    var docs = await Variants.find({ status: "Pending" })
    docs.forEach(data => {
        prodID.push(data.prodID);
    })
    var pdocs = await Products.find({ $or: [{ _id: { $in: prodID } }, { status: "Pending" }] })
    res.render('./admin/verification/products/products', { productsData: pdocs, userType: req.session.type, userName: req.session.name })
})

router.get('/viewProduct/(:id)/', checkAuth, async(req, res) => {
    const allImages = Variants.find().select("images")
    var id = req.params.id;
    var element = await Products.findById(id)
    var docs = await Variants.find({ 'prodID': id })
    res.render('./admin/verification/products/viewProduct', { images: allImages, variantsData: docs, productData: element, userType: req.session.type, userName: req.session.name });
})

router.get('/viewproductStatus/(:id)/(:status)', checkAuth, async(req, res) => {
    const allImages = Variants.find().select("images")
    var id = req.params.id;
    var status = req.params.status;
    if (status == "Verified") {
        var element = await Products.findById(id)
        var docs = await Variants.find({ 'prodID': id, status: "Verified" })
        res.render('./admin/verification/products/viewproductStatus', { images: allImages, variantsData: docs, productData: element, userType: req.session.type, userName: req.session.name });
    } else if (status == "Total") {
        var element = await Products.findById(id)
        var docs = await Variants.find({ 'prodID': id })
        res.render('./admin/verification/products/viewproductStatus', { images: allImages, variantsData: docs, productData: element, userType: req.session.type, userName: req.session.name });
    } else {
        var element = await Products.findById(id)
        var docs = await Variants.find({ 'prodID': id, $nor: [{ status: "Pending" }, { status: "Verified" }, { status: "Incomplete" }] })
        res.render('./admin/verification/products/viewproductStatus', { images: allImages, variantsData: docs, productData: element, userType: req.session.type, userName: req.session.name });

    }
})

router.get('/accept-product/(:id)', checkAuth, async(req, res) => {
    const id = req.params.id
    var newValues = { status: "Verified" }
    await Products.updateOne({ _id: id }, { $set: newValues })
    res.send("Verified")
})

router.post('/reject-product', async(req, res) => {
    const id = req.body.productID
    var newValues = { status: req.body.status }
    await Variants.updateMany({ 'prodID': id }, { $set: newValues })
    await Products.updateOne({ _id: id }, { $set: newValues })
    res.send('Rejected')
})

router.get('/seller', checkAuth, async(req, res) => {
    var docs = await Seller.find({ status: "Pending" })
    res.render('./admin/verification/seller/seller', { sellersData: docs, userType: req.session.type, userName: req.session.name })

});

router.get('/viewSeller/(:id)', checkAuth, async(req, res) => {
    var doc = await Seller.findById(req.params.id).populate('busCat')
    var category = []
    for (let i = 0; i < doc.busCat.length; i++) {
        category.push(doc.busCat[i].catName)
    }

    res.render('./admin/verification/seller/viewSeller', { sellerData: doc, category, userType: req.session.type, userName: req.session.name })
})

router.post('/reject-seller/(:id)', async(req, res) => {
    const id = req.params.id
    var newValues = { status: "Rejected : " + req.body.rejectText }
    await Seller.updateOne({ _id: id }, { $set: newValues })
    res.redirect('/admin/verification/seller')

})

router.get('/accept-seller/(:id)', async(req, res) => {
    const id = req.params.id
    var newValues = { status: "Verified" }
    await Seller.updateOne({ _id: id }, { $set: newValues })
    res.redirect('/admin/verification/seller')
})

router.post('/verify-variant', async(req, res) => {
    var newValues = { status: req.body.status, }
    await Variants.updateOne({ _id: req.body.variantID }, { $set: newValues })
    res.send("Success")
})

router.post('/check-variant', async(req, res) => {
    var count = 0
    var docs = await Variants.find({ 'prodID': req.body.productID })
    docs.forEach(data => {
        if (data.status == "Pending") {
            count = 1;
        }
    })
    if (count == 0) {
        res.json({ status: true });
    } else {
        res.json({ status: false });
    }
})

router.get('/productStatus', checkAuth, async(req, res) => {
    var status = req.query.status
    if (status == "Rejected") {
        rejectprodID = [];
        var docs = await Variants.find({ $nor: [{ status: "Pending" }, { status: "Verified" }, { status: "Incomplete" }] })
        docs.forEach(data => {
            rejectprodID.push(data.prodID);
        })
        var pdocs = await Products.find({ $or: [{ _id: { $in: rejectprodID } }, { $nor: [{ status: "Pending" }, { status: "Verified" }, { status: "Incomplete" }] }] })
        res.render('./admin/verification/products/rejectedproductStatus', { productsData: pdocs, userType: req.session.type, userName: req.session.name })

    } else {
        if (!status) {
            var docs = await Products.find({ $nor: [{ status: "Incomplete" }] })
            res.render('./admin/verification/products/totalproductStatus', { productsData: docs, userType: req.session.type, userName: req.session.name })
        } else {
            var docs = await Products.find({ status: status, })
            res.render('./admin/verification/products/productStatus', { productsData: docs, userType: req.session.type, userName: req.session.name })
        }
    }
})

router.get('/sellerStatus', checkAuth, async(req, res) => {
    var status = req.query.status
    if (status == "Rejected") {
        var docs = await Seller.find({ $nor: [{ status: "Pending" }, { status: "Verified" }, { status: "Authentication" }] })
        res.render('./admin/verification/seller/sellerStatus', { sellersData: docs, userType: req.session.type, userName: req.session.name })
    } else {
        if (!status) {
            var docs = await Seller.find()
            res.render('./admin/verification/seller/sellerStatus', { sellersData: docs, userType: req.session.type, userName: req.session.name })
        } else {
            var docs = await Seller.find({ status: status, })
            res.render('./admin/verification/seller/sellerStatus', { sellersData: docs, userType: req.session.type, userName: req.session.name })
        }

    }
})

router.get('/viewsellerStatus/(:id)', checkAuth, async(req, res) => {
    var doc = await Seller.findById(req.params.id)
    res.render('./admin/verification/seller/viewsellerStatus', { sellerData: doc, userType: req.session.type, userName: req.session.name })
})

router.get('/gallery', checkAuth, async(req, res) => {
    var galDocs = await Gallery.find({ images: { $elemMatch: { status: 'Pending' } } })
    res.render('./admin/verification/gallery', { galDocs: galDocs, userType: req.session.type, userName: req.session.name })
})

router.post('/gallery-status', checkAuth, async(req, res) => {
    var query = {}
    query['images.' + req.body.index + '.status'] = req.body.val
    await Gallery.findOneAndUpdate({ sellerID: req.body.sellerID }, { $set: query })
    res.json({ status: req.body.val })
})

module.exports = router