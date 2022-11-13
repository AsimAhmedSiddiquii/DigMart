const express = require("express")
const router = express.Router()
var mongoose = require("mongoose");
const multer = require("multer")
const fs = require("fs");
require("firebase/storage");

const OrderItem = require('../../models/user/order_item');
const Variants = require('../../models/seller/variants');
const Products = require('../../models/seller/product');
const Category = require('../../models/admin/categorySchema');
const Seller = require('../../models/seller/seller');

const checkAuth = require("../../middleware/seller/checkAuth")

const firebase = require('../../utils/firebase');
const storage = firebase.storage().ref();

const store = multer.memoryStorage();
var upload = multer({ storage: store });

var imgUpload = upload.fields([{ name: 'images', maxCount: 5 }])

router.get('/', checkAuth, async(req, res) => {
    var status = req.query.status
    if (status == "Rejected") {
        const docs = await Products.find({ sellerID: req.session.sellerID, $nor: [{ status: "Pending" }, { status: "Incomplete" }, { status: "Verified" }] }).populate('category subcategory')
        res.render('./seller/products/products', { productsData: docs, sellerID: req.session.sellerID, pFname: req.session.pFname, pLname: req.session.pLname })
    } else if (status == "Pending") {
        const docs = await Products.find({ sellerID: req.session.sellerID, status: "Pending" }).populate("category subcategory")
        res.render('./seller/products/products', { productsData: docs, sellerID: req.session.sellerID, pFname: req.session.pFname, pLname: req.session.pLname })
    } else if (status == "Incomplete") {
        const docs = await Products.find({ sellerID: req.session.sellerID, status: "Incomplete" }).populate("category subcategory")
        res.render('./seller/products/products', { productsData: docs, sellerID: req.session.sellerID, pFname: req.session.pFname, pLname: req.session.pLname })
    } else if (!status) {
        const docs = await Products.find({ sellerID: req.session.sellerID }).populate("category subcategory")
        res.render('./seller/products/products', { productsData: docs, sellerID: req.session.sellerID, pFname: req.session.pFname, pLname: req.session.pLname })
    } else {
        const docs = await Products.find({ sellerID: req.session.sellerID, status: status }).populate("category subcategory")
        res.render('./seller/products/products', { productsData: docs, sellerID: req.session.sellerID, pFname: req.session.pFname, pLname: req.session.pLname })
    }
})

router.get('/add-product', checkAuth, async(req, res) => {
    const documents = await Products.find({ sellerID: req.session.sellerID }).select().exec()
    const busCategory = await Seller.find({ _id: req.session.sellerID }).select("busCat").exec()

    var docs = await Category.find({ _id: busCategory[0]["busCat"] }).select("catName sub_category variant")
    res.render("./seller/products/add-product", { catData: docs, prodsData: documents, sellerID: req.session.sellerID, pFname: req.session.pFname, pLname: req.session.pLname })
});

router.post('/add-product', [checkAuth, imgUpload], async(req, res, next) => {
    var specsArr = [{
        "specName": req.body.specName,
        "specValue": req.body.specValue,
    }, ];

    try {
        var rawSS = req.files.images;
        var imageArr = [];
        if (rawSS) {
            for (let i = 0; i < rawSS.length; i++) {
                const imageRef = storage.child("/products/" + (rawSS[i].fieldname + '-' + Date.now() + rawSS[i].originalname));
                await imageRef.put(rawSS[i].buffer, { contentType: rawSS[i].mimetype })
                var url = await imageRef.getDownloadURL()
                imageArr.push(url)
            }
        }

        var specificationsArr = [];
        var a = specsArr[0]["specName"].length

        for (var i = 0; i < a; i++) {
            specificationsArr.push({
                specName: specsArr[0]["specName"][i],
                specValue: specsArr[0]["specValue"][i],
            })
        }

        var prodStatus;
        if (req.body.hasVariant) {
            prodStatus = "Pending"
        } else {
            prodStatus = "Incomplete"
        }
        var myId = mongoose.Types.ObjectId();
        var slugtext = req.body.productName + myId;
        var slugID = slugtext.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        var productData = new Products({
            _id: myId,
            slugID: slugID,
            images: imageArr,
            sellerID: req.session.sellerID,
            productName: req.body.productName,
            description: req.body.description,
            category: req.body.category,
            subcategory: req.body.subcategory,
            brand: req.body.brand,
            specifications: specificationsArr,
            actualPrice: req.body.actualPrice,
            discount: req.body.discount,
            finalPrice: req.body.finalPrice,
            quantity: req.body.quantity,
            hasVariant: req.body.hasVariant,
            status: prodStatus,
        })
        await productData.save();
        res.redirect('/seller/products/?status=' + prodStatus)
    } catch (err) {
        console.log("Error Occurred while adding product to Database");
    }
});

router.get("/edit-product/(:id)", checkAuth, async(req, res, next) => {
    const documents = await Products.find({ sellerID: req.session.sellerID }).select().exec()
    const doc = await Products.findById(req.params.id)

    const busCategory = await Seller.find({ _id: req.session.sellerID }).select("busCat").exec()
    const docs = await Category.find({ _id: busCategory[0]["busCat"] }).select("catName sub_category variant")
    res.render('./seller/products/edit-product', { catData: docs, productData: doc, prodsData: documents, sellerID: req.session.sellerID, pFname: req.session.pFname, pLname: req.session.pLname });

});

router.post("/edit-product/:productID", [checkAuth, imgUpload], async(req, res) => {
    const id = req.params.productID

    var specsArr = [{
        "specName": req.body.specName,
        "specValue": req.body.specValue,
    }, ];

    var imageArr = [];
    var products = await Products.findById(id).exec()
    for (let i = 0; i < products.images.length; i++) {
        imageArr.push(products.images[i])
    }

    var rawSS = req.files.images;
    if (rawSS) {
        for (let i = 0; i < rawSS.length; i++) {
            const imageRef = storage.child("/products/" + (rawSS[i].fieldname + '-' + Date.now() + rawSS[i].originalname));
            await imageRef.put(rawSS[i].buffer, { contentType: rawSS[i].mimetype })
            var url = await imageRef.getDownloadURL()
            imageArr.push(url)
        }
    }

    var specificationsArr = [];
    var a = specsArr[0]["specName"].length

    for (var i = 0; i < a; i++) {
        if (specsArr[0]["specName"][i] != "" && specsArr[0]["specValue"][i] != "") {
            specificationsArr.push({
                specName: specsArr[0]["specName"][i],
                specValue: specsArr[0]["specValue"][i]
            })
        }
    }

    var variantStatus;
    var prodStatus;

    var docs = await Variants.find({ 'prodID': id }).select("status")
    for (var i in docs) {
        if (docs[i].status != "Pending") {
            variantStatus = "Rejected";
            break;
        }
    }

    if (req.body.status == "Pending") {
        prodStatus = "Pending";
    } else if (req.body.status == "Incomplete") {
        prodStatus = "Incomplete";
    } else if (req.body.status == "Verified") {
        prodStatus = "Verified";
    } else {
        if (variantStatus != "Rejected") {
            prodStatus = "Pending"
        }
    }

    Products.findByIdAndUpdate({ _id: id }, {
            $set: {
                images: imageArr,
                productName: req.body.productName,
                description: req.body.description,
                category: req.body.category,
                subcategory: req.body.subcategory,
                brand: req.body.brand,
                specifications: specificationsArr,
                actualPrice: req.body.actualPrice,
                discount: req.body.discount,
                finalPrice: req.body.finalPrice,
                quantity: req.body.quantity,
                hasVariant: req.body.hasVariant,
                status: prodStatus,
                disabled: req.body.disabled
            }
        })
        .exec()
        .then(result => {
            console.log(result)
            if (prodStatus != "Verified" && prodStatus != "Pending" && prodStatus != "Incomplete") {
                prodStatus = "Rejected"
            }
            res.redirect('/seller/products/?status=' + prodStatus)
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
});

router.get("/delete-product/(:id)/(:status)", checkAuth, async(req, res, next) => {
    var status = req.params.status
    const id = req.params.id;

    var doc = await OrderItem.find({ productID: id }).select().exec()
    if (doc.length == 0) {
        var products = await Products.findByIdAndRemove(id).exec()

        for (let i = 0; i < products.images.length; i++) {
            var imagePath = products.images[i].split("?")
            var fileRef = firebase.storage().refFromURL(imagePath[0]);
            await fileRef.delete()
        }
        res.send({ disabled: false })
    } else {
        await Products.updateOne({ _id: id }, { $set: { disabled: true } })
        res.send({ disabled: true })
    }
});

router.get("/delete-image/(:id)/(:a)", checkAuth, async(req, res, next) => {

    const index = req.params.a
    var products = await Products.findById(req.params.id).exec()

    var imagePath = products.images[index].split("?")
    var fileRef = firebase.storage().refFromURL(imagePath[0]);
    await fileRef.delete();

    products.images.splice(index, 1)

    Products.findByIdAndUpdate({ _id: req.params.id }, {
            $set: {
                images: products.images
            }
        })
        .exec()
        .then(result => {
            res.redirect("/seller/products/edit-product/" + req.params.id);
        })
});

module.exports = router