const express = require("express")
const router = express.Router()
const mongoose = require('mongoose')
const multer = require("multer");

const Review = require('../../models/user/reviews');
const User = require('../../models/user/user');
const Products = require('../../models/seller/product');
const OrderItem = require('../../models/user/order_item')

const CheckAuth = require('../../middleware/user/checkAuth');

const firebase = require("../../utils/firebase");
const storage = firebase.storage().ref();
const store = multer.memoryStorage();
var upload = multer({ storage: store });

var imgUpload = upload.fields([{ name: "images", maxCount: 4 }]);

router.post('/', [imgUpload], async(req, res) => {
    var user = await User.findById(req.session.userID).select('fullName')
    var prod = await Products.findById(req.body.productID).select('slugID')
    var rawSS = req.files.images;
    var imageArr = [];
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let currentDate = `${day}-${month}-${year}`
    if (rawSS) {
        for (let i = 0; i < rawSS.length; i++) {
            const imageRef = storage.child("/reviews/" + (user.fullName + '-' + Date.now() + '-' + rawSS[i].originalname));
            await imageRef.put(rawSS[i].buffer, { contentType: rawSS[i].mimetype });
            var url = await imageRef.getDownloadURL();
            imageArr.push(url)
        }
        var reviewdata = new Review({
            _id: mongoose.Types.ObjectId(),
            userID: req.session.userID,
            sellerID: req.body.sellerID,
            productID: req.body.productID,
            images: imageArr,
            rating: req.body.btnradio,
            date: currentDate,
            reviewHeadline: req.body.reviewHeadline,
            reviewText: req.body.reviewText
        })

        await reviewdata.save()
        res.redirect('/product/view-product/' + prod.slugID);
    } else {
        var reviewdata = new Review({
            _id: mongoose.Types.ObjectId(),
            userID: req.session.userID,
            sellerID: req.body.sellerID,
            productID: req.body.productID,
            rating: req.body.btnradio,
            date: currentDate,
            reviewHeadline: req.body.reviewHeadline,
            reviewText: req.body.reviewText
        })

        await reviewdata.save()
        res.redirect('/product/view-product/' + prod.slugID);
    }
})

router.post('/checkprof', async(req, res) => {
    if (req.session.userID) {
        var user = await User.findById(req.session.userID).select('fullName')
        if (user.fullName) {
            var order = await OrderItem.find({ userID: req.session.userID, productID: req.body.productID })
            if (order.length != 0) {
                var prod = await Review.find({ userID: req.session.userID, productID: req.body.productID })
                if (prod.length != 0) {
                    res.json({ status: "Reviewed" });
                } else {
                    res.json({ status: true });
                }
            } else {
                res.json({ status: "noOrders" });
            }

        } else {
            res.json({ status: false });
        }
    } else {
        res.json({ status: "login" });
    }
})

router.get('/reviews-and-ratings', CheckAuth, async(req, res) => {
    var personalData = await User.findById(req.session.userID)
    var reviews = await Review.find({ userID: req.session.userID }).sort({ "rating": -1 });
    res.render('./user/review-page', { reviews, personalData, user: req.session.userID })
})

router.get('/delete-review/(:reviewID)', CheckAuth, async(req, res) => {
    await Review.findByIdAndRemove(req.params.reviewID)
    res.redirect('/review/reviews-and-ratings')
})

module.exports = router