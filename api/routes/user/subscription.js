const express = require("express")
const router = express.Router()

const Subscribe = require('../../models/user/subscribe');
const Ads = require('../../models/seller/ads')
const Variants = require('../../models/seller/variants')

const checkAuth = require("../../middleware/user/checkAuth")

router.get('/add-subscription/(:sellerID)', async(req, res) => {
    if (req.session.userID) {
        const subscription = new Subscribe({
            userID: req.session.userID,
            sellerID: req.params.sellerID
        })
        await subscription.save()
        return res.send({ result: true, login: true })
    }
    res.send({ result: false, login: false })
})

router.get('/remove-subscription/(:sellerID)', async(req, res) => {
    if (req.session.userID) {
        await Subscribe.findOneAndRemove({ sellerID: req.params.sellerID, userID: req.session.userID })
        res.send({ result: true, login: true })
    } else {
        res.send({ result: false, login: false })
    }
})

router.get('/', checkAuth, async(req, res) => {
    const subsData = await Subscribe.find({ userID: req.session.userID }).populate('sellerID')

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

    res.render('./user/subscription', { varDocs, promotedProducts, subsData, user: req.session.userID })
})

module.exports = router