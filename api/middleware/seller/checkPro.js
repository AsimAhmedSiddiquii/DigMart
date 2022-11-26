const Seller = require('../../models/seller/seller')

module.exports = async(req,res,next) => {
    if (req.session.sellerID) {
        var seller = await Seller.findById(req.session.sellerID)
        if (seller.plan.title == "Pro") {
            next();
        } else {
            res.redirect("/seller/dashboard")
        }
    } else {
        res.redirect("/seller/login")
    }
    
};