const express = require("express")
const router = express.Router()
const https = require('https')

const Ads = require('../../models/seller/ads');
const Products = require('../../models/seller/product');
const checkAuth = require("../../middleware/seller/checkAuth")

const { sendEmail } = require('../../utils/emailOtp')
const checksum_lib = require('../../utils/checksum')
const config = require('../../utils/config')

router.get('/promoted-products', checkAuth, async(req, res) => {
    var promotedProducts = await Ads.find({ sellerID: req.session.sellerID, expireDate: { $gte: new Date() } }).populate('productID')
    res.render("./seller/promote/promoted", { promotedProducts, sellerID: req.session.sellerID, pFname: req.session.pFname, pLname: req.session.pLname })
})

router.get('/promote-product/(:productID)', checkAuth, async(req, res) => {

    var checkAd = await Ads.find({
        productID: req.params.productID,
        expireDate: { $gte: new Date() }
    })

    if (checkAd.length == 0) {
        var product = await Products.findById(req.params.productID).populate('category')
        res.render('./seller/promote/promote-product', { product, sellerID: req.session.sellerID, pFname: req.session.pFname, pLname: req.session.pLname })
    } else {
        res.redirect('/seller/promote/promoted-products')
    }
})

router.post('/promote-product', checkAuth, async(req, res) => {
    var expdate = new Date();
    expdate.setDate(expdate.getDate() + Number(req.body.days))

    var amount = 49 * Number(req.body.days)

    var params = {};
    params['MID'] = config.PaytmConfig.mid;
    params['WEBSITE'] = config.PaytmConfig.website;
    params['CHANNEL_ID'] = 'WEB';
    params['INDUSTRY_TYPE_ID'] = 'Retail';
    params['ORDER_ID'] = 'DIG_' + new Date().getTime();
    params['CUST_ID'] = req.session.sellerID;
    params['TXN_AMOUNT'] = amount.toString();
    params['CALLBACK_URL'] = 'http://localhost:8080/seller/promote/callback';

    var adsData = new Ads({
        orderID: params['ORDER_ID'],
        productID: req.body.prodID,
        sellerID: req.session.sellerID,
        expireDate: expdate
    })

    checksum_lib.genchecksum(params, config.PaytmConfig.key, async function(err, checksum) {
        var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
        // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production

        var form_fields = "";
        for (var x in params) {
            form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
        }
        form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

        await adsData.save()
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<html><head><title>Promote Product</title></head><body><center><h2>Redirecting, Please do not refresh this page...</h2></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
        res.end();
    });
})

router.post('/callback', (req, res) => {
    var checksumhash = req.body.CHECKSUMHASH;

    var result = checksum_lib.verifychecksum(req.body, config.PaytmConfig.key, checksumhash);
    console.log("Checksum Result => ", result, "\n");
    var params = { "MID": config.PaytmConfig.mid, "ORDERID": req.body.ORDERID };

    checksum_lib.genchecksum(params, config.PaytmConfig.key, function(err, checksum) {
        params.CHECKSUMHASH = checksum;
        post_data = 'JsonData=' + JSON.stringify(params);

        var options = {
            hostname: 'securegw-stage.paytm.in', // for staging
            // hostname: 'securegw.paytm.in', // for production
            port: 443,
            path: '/merchant-status/getTxnStatus',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': post_data.length
            }
        };

        // Set up the request
        var response = "";
        var post_req = https.request(options, function(post_res) {

            post_res.on('data', function(chunk) {
                response += chunk;
            });

            post_res.on('end', async function() {
                var _result = JSON.parse(response);

                if (_result.STATUS == 'TXN_SUCCESS') {
                    await Ads.findOneAndUpdate({ orderID: req.body.ORDERID }, { $set: { paymentDone: true } })
                    res.redirect("/seller/promote/payment-success/" + req.body.ORDERID)
                } else {
                    res.send('payment failed')
                }
            });
        });
        post_req.write(post_data);
        post_req.end();
    });
})

router.get('/payment-success/(:orderID)', async(req, res) => {
    var ads = await Ads.findOne({ orderID: req.params.orderID }).populate('sellerID')
    await sendEmail({ email: ads.sellerID.busEmail, subj: 'DigMart - Product Promoted Successfully', msg: "Hello :D" })
    res.render('./seller/promote/order-confirmed')
})

module.exports = router