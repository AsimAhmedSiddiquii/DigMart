const express = require("express")
const router = express.Router()

const Cart = require('../../models/user/cart')
const Ads = require('../../models/seller/ads')
const Variants = require('../../models/seller/variants')

const checkAuth = require("../../middleware/user/checkAuth")
const useLocals = require("../../middleware/user/useLocals")

router.get('/', [checkAuth, useLocals], async(req, res) => {
    var subtotal = 0;
    var size = [];

    var docs = await Cart.find({ userID: req.session.userID }).populate('sellerID productID variantID')

    for (let i = 0; i < docs.length; i++) {
        if (docs[i].variantID) {
            for (let j = 0; j < docs[i].variantID.sizes.length; j++) {
                if (docs[i].variantID.sizes[j].sizes == docs[i].size) {
                    subtotal = subtotal + (Number(docs[i].variantID.sizes[j].finalPrice) * (Number(docs[i].quantity)));
                    size.push(j);
                }
            }
        } else {
            subtotal = subtotal + (Number(docs[i].productID.finalPrice) * (Number(docs[i].quantity)));
            size.push(0);
        }
    }

    // Ads
    var varDocs = []
    var promotedProducts = await Ads.find({ paymentDone: true, expireDate: { $gte: new Date() } }).populate('productID sellerID').limit(4)
    promotedProducts.sort(() => Math.random() - 0.5);

    for (let i = 0; i < promotedProducts.length; i++) {
        if (promotedProducts[i].productID.hasVariant) {
            var doc = await Variants.find({ prodID: promotedProducts[i].productID._id })
            varDocs.push(doc[0])
        }
    }

    res.render('user/cart', { promotedProducts, varDocs, cartData: docs, subTotal: subtotal.toFixed(2), Total: (subtotal).toFixed(2), size })
})

router.post('/add-to-cart', async(req, res) => {

    if (req.session.userID) {
        if (req.body.variantID) {

            var cartdata = new Cart({
                userID: req.session.userID,
                sellerID: req.body.sellerID,
                variantID: req.body.variantID,
                productID: req.body.productID,
                colour: req.body.colour,
                size: req.body.size,
                quantity: "1"
            })

            var doc = await Cart.find({ variantID: req.body.variantID, userID: req.session.userID, size: req.body.size })
            if (doc.length != 0) {
                return res.json({ status: false, login: true });
            }
        } else {
            var cartdata = new Cart({
                _id: mongoose.Types.ObjectId(),
                userID: req.session.userID,
                sellerID: req.body.sellerID,
                productID: req.body.productID,
                quantity: "1"
            })
            var docs = await Cart.find({ productID: req.body.productID, userID: req.session.userID })
            if (docs.length != 0) {
                return res.json({ status: false, login: true });
            }
        }
        await cartdata.save()
        res.json({ status: true, login: true });
    } else {
        res.json({ login: false });
    }

})

router.get('/delete-cart/(:cartID)', checkAuth, async(req, res) => {
    await Cart.findByIdAndRemove(req.params.cartID)
    res.redirect('/cart')
})

router.post('/edit-cart', async(req, res) => {
    var docs = await Cart.find({ _id: req.body.id })
    if (docs.length != 0) {
        await Cart.updateOne({ _id: req.body.id }, { $set: { quantity: req.body.qty } })
        res.send("Done");
    }
})

module.exports = router