const express = require("express")
const router = express.Router()

const Notifications = require('../../models/user/notification');

const checkAuth = require("../../middleware/user/checkAuth")
const useLocals = require("../../middleware/user/useLocals")

router.get('/', [checkAuth, useLocals], async (req, res) => {
    const notifyData = await Notifications.find({ userID: req.session.userID, expireDate: { $gte: new Date() }, paymentDone: true }).populate('sellerID')
    res.render('./user/account/notifications', { notifyData })
})

module.exports = router