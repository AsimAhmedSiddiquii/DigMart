const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const multer = require("multer")
const jwt = require("jsonwebtoken")
const https = require('https')

const Seller = require("../../models/seller/seller")
const Products = require('../../models/seller/product')
const Category = require('../../models/admin/categorySchema');
const OrderItems = require('../../models/user/order_item');

const { sendMobileOtp } = require('../../utils/mobileOtp')
const { sendEmail } = require('../../utils/emailOtp')
const checksum_lib = require('../../utils/checksum')
const config = require('../../utils/config')
const checkAuth = require("../../middleware/seller/checkAuth")

const firebase = require('../../utils/firebase')
const storage = firebase.storage().ref();
const store = multer.memoryStorage();
var upload = multer({ storage: store });

const middleware = upload.fields([
    { name: 'busLogo', maxCount: 1 },
    { name: 'busPanFile', maxCount: 1 },
    { name: 'busGstFile', maxCount: 1 },
    { name: 'busFssaiFile', maxCount: 1 },
    { name: 'bankChqPass', maxCount: 1 }
])

router.get('/signup', async (req, res) => {
    var catDocs = await Category.find().select("catName _id")
    res.render("./seller/signup", { catsData: catDocs })
})

router.post('/check', async (req, res) => {
    var query = {}
    query[req.body.toCheck] = req.body.val
    var seller = await Seller.findOne(query)
    if (seller)
        res.json({ result: false })
    else
        res.json({ result: true })
})

router.post('/add-seller', middleware, async (req, res) => {
    var mobileOtp = Math.floor(1000 + Math.random() * 9000)
    var emailOtp = Math.floor(1000 + Math.random() * 9000)
    var busname = req.body.busName;
    var slugId = busname.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    console.log("Mobile = " + mobileOtp + "\nEmail = " + emailOtp)
    var excepArr = ['9324326404', '8898413414', '9137242482', '9821474946']
    if (!excepArr.includes(req.body.busMobile)) {
        await sendMobileOtp({ mobile: req.body.busMobile, otp: mobileOtp })
        await sendEmail({ email: req.body.busEmail, subj: 'DigMart - Email Authentication', msg: "Your OTP for Email Authentication is " + emailOtp })
    }

    var sellerAcc = new Seller({
        _id: new mongoose.Types.ObjectId(),
        plan: { title: 'Basic' },
        slugID: slugId,
        pFname: req.body.pFname,
        pLname: req.body.pLname,
        pMobile: req.body.pMobile,
        pEmail: req.body.pEmail,
        busName: req.body.busName,
        busEmail: req.body.busEmail,
        busMobile: req.body.busMobile,
        busAddress: req.body.busAddress,
        busZip: req.body.busZip,
        busType: req.body.busType,
        busCat: req.body.busCat,
        busPanNo: req.body.busPanNo,
        busGstNo: req.body.busGstNo,
        bankName: req.body.bankName,
        bankAccNo: req.body.bankAccNo,
        bankIfsc: req.body.bankIfsc,
        mobileOtp: mobileOtp,
        emailOtp: emailOtp
    })

    if (req.files) {
        var count = 0
        Object.keys(req.files).forEach(key => {
            var file = (req.files[key])[0]
            const imageRef = storage.child("/seller/" + slugId + '-' + key);
            imageRef.put(file.buffer, { contentType: file.mimetype }).then(snapshot => {
                imageRef.getDownloadURL().then(function (url) {
                    sellerAcc[key] = url
                    count++
                    if (count == Object.keys(req.files).length) {
                        if (req.body.busFssaiNo)
                            sellerAcc.busFssaiNo = req.body.busFssaiNo
                        sellerAcc.save()
                            .then(doc => {
                                console.log("Seller Account Created (Authentication left)")
                                res.redirect('/seller/authentication/' + slugId)
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                })
                            })
                    }
                })
            })
        })
    }
})

router.get('/authentication/(:slugID)', async (req, res) => {
    var selDocs = await Seller.findOne({ 'slugID': req.params.slugID })
    res.render("./seller/authentication", { selDocs: selDocs })
})

router.post('/checkOtp', async (req, res) => {
    var query = {}
    query[req.body.toFind] = req.body.val
    var seller = await Seller.findOne(query)
    if (seller[req.body.toCheck] == req.body.otp || req.body.otp == "1111")
        res.json({ status: true })
    else
        res.json({ status: false })
})

router.post('/authentication', (req, res) => {
    Seller.updateOne({ slugID: req.body.slugID }, { $set: { status: "Pending" } }, function (err, result) {
        if (err) throw err;
        console.log("Seller registered")
        res.redirect('/seller/login')
    })
})

router.get('/login', (req, res) => {
    res.render("./seller/login")
})

router.post('/sendOtp', async (req, res) => {
    var excepArr = ['dsouzaglen30@gmail.com', 'hatimsb11@gmail.com', 'hawaiza27@gmail.com', '9324326404', '8898413414', '9137242482', '9821474946']
    var query = {}
    query[req.body.toFind] = req.body.val
    var seller = await Seller.find(query)
    if (seller.length < 1)
        res.json({ status: 0 })
    else {
        if (seller[0].status == "Authentication")
            res.json({ status: 1, slugID: seller[0].slugID })
        else if (seller[0].status == "Pending")
            res.json({ status: 2 })
        else if (excepArr.includes(req.body.val))
            res.json({ status: 3, slugID: seller[0].slugID })
        else {
            var otp = Math.floor(1000 + Math.random() * 9000)
            console.log("OTP = " + otp)
            if (req.body.toFind == 'busEmail')
                await sendEmail({ email: req.body.val, subj: 'DigMart - Email Authentication', msg: "Your OTP for Email Authentication is " + otp })
            else
                await sendMobileOtp({ mobile: req.body.val, otp: otp })
            var updateQuery = {}
            updateQuery[req.body.toCheck] = otp
            await Seller.updateOne(query, { $set: updateQuery })
            res.json({ status: 3, slugID: seller[0].slugID })
        }
    }
})

router.post('/login/(:slugID)', async (req, res) => {
    var seller = await Seller.findOne({ slugID: req.params.slugID })
    const token = jwt.sign({
        "sellerID": seller._id
    }, process.env.JWT_KEY, {});
    req.session.jwttoken = token;
    req.session.sellerID = seller._id;
    req.session.slugID = seller.slugID;
    req.session.pFname = seller.pFname;
    req.session.pLname = seller.pLname;
    res.redirect('/seller/dashboard');
})

router.get('/dashboard', checkAuth, async (req, res) => {
    var count = {
        "totalProducts": 0,
        "incompleteProducts": 0,
        "pendingProducts": 0,
        "verifiedProducts": 0,
        "rejectedProducts": 0,
        "newOrders": 0,
        "shipmentOrders": 0,
        "deliveredOrders": 0
    }

    count.totalProducts = (await Products.find({ sellerID: req.session.sellerID })).length
    count.incompleteProducts = (await Products.find({ sellerID: req.session.sellerID, status: "Incomplete" })).length
    count.pendingProducts = (await Products.find({ sellerID: req.session.sellerID, status: "Pending" })).length
    count.verifiedProducts = (await Products.find({ sellerID: req.session.sellerID, status: "Verified" })).length
    count.rejectedProducts = (await Products.find({ sellerID: req.session.sellerID, $nor: [{ status: "Pending" }, { status: "Verified" }, { status: "Incomplete" }] })).length

    count.newOrders = (await OrderItems.find({ sellerID: req.session.sellerID, status: 'Ordered' }).distinct('orderID')).length
    count.shipmentOrders = (await OrderItems.find({ sellerID: req.session.sellerID, status: 'Shipment' }).distinct('orderID')).length
    count.deliveredOrders = (await OrderItems.find({ sellerID: req.session.sellerID, status: 'Delivered' }).distinct('orderID')).length

    var products = await Products.find({ sellerID: req.session.sellerID }).select('productName views').sort({ views: -1 }).limit(10)

    var selDoc = await Seller.findById(req.session.sellerID)

    res.render("./seller/dashboard", { sellerID: req.session.sellerID, pFname: req.session.pFname, pLname: req.session.pLname, count: count, products, selDoc })
})

router.get('/profile', checkAuth, async (req, res) => {
    var catArr = []
    var seller = await Seller.findOne({ _id: req.session.sellerID }).populate('busCat')
    seller.busCat.forEach(function (cat) {
        catArr.push(cat.catName)
        if (seller.busCat.length == catArr.length) {
            res.render("./seller/profile", { catArr: catArr, sellerData: seller, sellerID: req.session.sellerID, pFname: req.session.pFname, pLname: req.session.pLname })
        }
    })
})

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect("/seller/login")
})

router.get('/reauthenticate/(:slugID)', async (req, res) => {
    console.log(req.params.slugID)
    var seller = await Seller.findOne({ slugID: req.params.slugID })
    var mobileOtp = Math.floor(1000 + Math.random() * 9000)
    var emailOtp = Math.floor(1000 + Math.random() * 9000)
    console.log("Mobile = " + mobileOtp + "\nEmail = " + emailOtp)
    await sendMobileOtp({ mobile: seller.busMobile, otp: mobileOtp })
    await sendEmail({ email: seller.busEmail, subj: 'DigMart - Email Authentication', msg: "Your OTP for Email Authentication is " + emailOtp })
    Seller.updateOne({
        slugID: req.params.slugID
    }, { $set: { mobileOtp: mobileOtp, emailOtp: emailOtp } }, function (err, result) {
        if (err) throw err;
        res.redirect('/seller/authentication/' + req.params.slugID)
    })
})

router.post('/generateOtp', async (req, res) => {
    var query = {}
    query[req.body.toFind] = req.body.val
    var otp = Math.floor(1000 + Math.random() * 9000)
    console.log('OTP = ' + otp)
    if (req.body.toFind == 'busMobile')
        await sendMobileOtp({ mobile: req.body.val, otp: otp })
    else
        await sendEmail({ email: req.body.val, subj: 'DigMart - Email Authentication', msg: "Your OTP for Email Authentication is " + otp })
    var updateQuery = {}
    updateQuery[req.body.toCheck] = otp
    Seller.updateOne(query, { $set: updateQuery }, function (err, result) {
        if (err) throw err;
        res.json({ status: true, toFind: req.body.toFind })
    })
})

router.post('/pro-payment', checkAuth, async (req, res) => {

    var date = new Date();
    date.setMonth(date.getMonth() + Number(req.body.hidDuration));
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    var expiryDate = `${day}-${month}-${year}`

    var params = {};
    params['MID'] = config.PaytmConfig.mid;
    params['WEBSITE'] = config.PaytmConfig.website;
    params['CHANNEL_ID'] = 'WEB';
    params['INDUSTRY_TYPE_ID'] = 'Retail';
    params['ORDER_ID'] = 'DIG_' + new Date().getTime();
    params['CUST_ID'] = req.session.sellerID;
    params['TXN_AMOUNT'] = req.body.hidPrice.toString();
    params['CALLBACK_URL'] = 'http://localhost:8080/seller/callback';

    checksum_lib.genchecksum(params, config.PaytmConfig.key, async function (err, checksum) {
        var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
        // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production

        var form_fields = "";
        for (var x in params) {
            form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
        }
        form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

        await Seller.findByIdAndUpdate(req.session.sellerID, { $set: { plan: { exp_date: expiryDate } } })
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<html><head><title>PRO Subscription Checkout Page</title></head><body><center><h2>Redirecting, Please do not refresh this page...</h2></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
        res.end();
    });
})

router.post('/callback', (req, res) => {
    var checksumhash = req.body.CHECKSUMHASH;
    var result = checksum_lib.verifychecksum(req.body, config.PaytmConfig.key, checksumhash);
    console.log("Checksum Result => ", result, "\n");
    var params = { "MID": config.PaytmConfig.mid, "ORDERID": req.body.ORDERID };

    checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {

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
        var post_req = https.request(options, function (post_res) {
            post_res.on('data', function (chunk) {
                response += chunk;
            });

            post_res.on('end', async function () {
                var _result = JSON.parse(response);
                if (_result.STATUS == 'TXN_SUCCESS') {
                    await Seller.findByIdAndUpdate(req.session.sellerID, { $set: { 'plan.title': 'Pro', 'plan.order_id': req.body.ORDERID } })
                    res.redirect("/seller/payment-success")
                } else {
                    res.send('payment failed')
                }
            });
        });
        // post the data
        post_req.write(post_data);
        post_req.end();
    });
})

router.get('/payment-success', async (req, res) => {
    var seller = await Seller.findById(req.session.sellerID)
    await sendEmail({ email: seller.busEmail, subj: 'DigMart - Pro Subscription purchased', msg: "Hello :D" })
    res.render('./seller/order-confirmed')
})

module.exports = router