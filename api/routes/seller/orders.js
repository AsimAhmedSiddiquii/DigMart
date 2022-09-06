const express = require("express")
const router = express.Router()

const Orders = require("../../models/seller/orders");

const checkAuth = require("../../middleware/seller/checkAuth")

router.get('/new-orders', checkAuth ,(req, res) => {
    res.render("./seller/orders/newOrders", {sellerID: req.session.sellerID , pFname: req.session.pFname, pLname: req.session.pLname})
})

router.get('/delivered-orders', checkAuth  , (req, res) => {
    res.render("./seller/orders/delivered", {sellerID: req.session.sellerID , pFname: req.session.pFname, pLname: req.session.pLname})
})

router.get('/shipment-orders', checkAuth  , (req, res) => {
    res.render("./seller/orders/shipment", {sellerID: req.session.sellerID , pFname: req.session.pFname, pLname: req.session.pLname})
})
module.exports = router