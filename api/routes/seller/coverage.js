const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")

const Coverage = require('../../models/seller/coverage');

const checkAuth = require("../../middleware/seller/checkAuth")

router.get('/', checkAuth, (req, res) => {
    res.render("./seller/coverage", { sellerID: req.session.sellerID, pFname: req.session.pFname, pLname: req.session.pLname })
})

router.post('/', (req, res) => {
    var result = (req.body.pin).split(/[, ]+/);
    var pinArray = []
    result.forEach(element => {
        pinArray.push({ pincode: element })
    });
    Coverage.replaceOne(
        { sellerID: req.session.sellerID },
        {
            sellerID: req.session.sellerID,
            state: req.body.state,
            district: req.body.district,
            pin: pinArray,
        },
        { upsert: true }
    ).exec().then((result) => {
        console.log(result)
        res.redirect('/seller/coverage')
    })
    .catch((error) => {
        console.log(error);
        res.status(500).json({
            message: error,
        });
    });
})

module.exports = router