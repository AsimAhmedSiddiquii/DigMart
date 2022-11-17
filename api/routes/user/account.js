const express = require("express")
const router = express.Router()
const mongoose = require('mongoose')

const checkAuth = require("../../middleware/user/checkAuth")
const Address = require("../../models/user/address");
const User = require('../../models/user/user');

router.get('/', checkAuth, async(req, res) => {
    var personalData = await User.findById(req.session.userID)
    res.render('./user/account', { personalData, user: req.session.userID })
})

router.post('/', async(req, res, next) => {
    var docs = await User.find({ _id: req.session.userID }).select("_id").exec();

    User.findByIdAndUpdate({ _id: docs[0]._id }, {
            $set: {
                fullName: req.body.fullName,
                email: req.body.email,
                mobile: req.body.mobile,
                gender: req.body.gender
            }
        })
        .exec()
        .then(result => {
            res.redirect('/account')
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})

router.get('/addresses', checkAuth, async(req, res) => {
    var personalData = await User.findById(req.session.userID)
    var docs = await Address.find({ userID: req.session.userID }).select().exec();
    res.render('./user/account-addresses', { personalData, addressData: docs, user: req.session.userID })
})

router.post('/add-address', async(req, res, next) => {
    try {
        var addressData = new Address({
            _id: mongoose.Types.ObjectId(),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            address: req.body.address,
            state: req.body.state,
            city: req.body.city,
            pinCode: req.body.pinCode,
            mobileNumber: req.body.mobileNumber
        })
        await addressData.save();
        res.redirect('/account/addresses')
    } catch (err) {
        console.log("Error Occurred while adding address to Database. " + err);
    }
})

router.get("/edit-address/(:addressID)", async(req, res) => {
    var id = req.params.addressID;
    const doc = await Address.findById(id)
    res.send(doc);
});

router.post("/edit-address/(:addressID)", (req, res) => {
    var id = req.params.addressID;
    Address.findByIdAndUpdate({ _id: id }, {
            $set: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                address: req.body.address,
                state: req.body.state,
                city: req.body.city,
                pinCode: req.body.pinCode,
                mobileNumber: req.body.mobileNumber
            }
        })
        .exec()
        .then(result => {
            console.log('Updated Address');
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
});

router.get("/delete-address/(:addressID)", async(req, res, next) => {
    var id = req.params.addressID;
    await Address.findByIdAndRemove(id).exec()
    res.redirect('/account/addresses');
});

module.exports = router