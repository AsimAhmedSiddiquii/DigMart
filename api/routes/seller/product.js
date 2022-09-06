const express = require("express")
const router = express.Router()
var mongoose = require("mongoose");
const multer = require("multer")
const fs = require("fs");

const Products = require('../../models/seller/product');
const Category = require('../../models/admin/categorySchema');

const checkAuth = require("../../middleware/seller/checkAuth")

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/productImages')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + file.originalname)
    }
})

var upload = multer({ storage: storage });

var imgUpload = upload.fields([{ name: 'images', maxCount: 5 }])


router.get('/', checkAuth, (req, res) => {
    var status = req.query.status
    if (status == "Rejected") {
        Products.find({ sellerID: req.session.sellerID, $nor: [{ status: "Pending" }, { status: "Verified" }] }).select("images productName description category subcategory sizes colours brand actualPrice discount finalPrice quantity status")
            .exec()
            .then(docs => {
                res.render('./seller/products/products', { productsData: docs, sellerID: req.session.sellerID, pFname: req.session.pFname, pLname: req.session.pLname })
            })
            .catch(err => {
                console.log(err)
                res.status(500).json({
                    error: err
                })
            })
    } else if (!status) {
        Products.find({ sellerID: req.session.sellerID }).select("images productName description category subcategory sizes colours brand actualPrice discount finalPrice quantity status")
            .exec()
            .then(docs => {
                res.render('./seller/products/products', { productsData: docs, sellerID: req.session.sellerID, pFname: req.session.pFname, pLname: req.session.pLname })
            })
            .catch(err => {
                console.log(err)
                res.status(500).json({
                    error: err
                })
            })
    } else {
        Products.find({ sellerID: req.session.sellerID, status: status, }).select("images productName description category subcategory sizes colours brand actualPrice discount finalPrice quantity status")
            .exec()
            .then(docs => {
                res.render('./seller/products/products', { productsData: docs, sellerID: req.session.sellerID, pFname: req.session.pFname, pLname: req.session.pLname })
            })
            .catch(err => {
                console.log(err)
                res.status(500).json({
                    error: err
                })
            })
    }
})

router.get('/add-product', checkAuth, (req, res) => {

    Category.find().select("catName sub_category status")
        .exec()
        .then(docs => {
            res.render("./seller/products/add-product", { catData: docs, sellerID: req.session.sellerID, pFname: req.session.pFname, pLname: req.session.pLname })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})


router.post('/add-product', imgUpload, async(req, res, next) => {
    // Object destructuring
    const { productName } = req.body;

    try {
        const productExists = await Products.findOne({ productName: productName })

        if (productExists) {
            res.send('A Product with the same name Already Exists. Try editting the same product or adding a new one!')
            // res.render('./admin/category/add', { catImage: allCatImages, categoryData: doc, userType: req.session.type, userName: req.session.name })

        }
        else{

        var rawSS = req.files.images;
        var imageArr = [];
        rawSS.forEach((element) => {
            imageArr.push((element.path).toString().substring(6));
        });

       

        var productData = new Products({
            _id: mongoose.Types.ObjectId(),
            images: imageArr,
            sellerID: req.session.sellerID,
            productName: req.body.productName,
            description: req.body.description,
            category: req.body.category,
            subcategory: req.body.subcategory,

            // colours: req.body.colours,
            brand: req.body.brand,
            actualPrice: req.body.actualPrice,
            discount: req.body.discount,
            finalPrice: req.body.finalPrice,
            
        })

        await productData.save();
    }
        res.redirect('/seller/products/?status=Pending')

    } catch (err) {
        console.log("Error Occurred while adding product to Database");
        console.log(err)
    }

});


router.get("/edit-product/(:id)", checkAuth, (req, res) => {
    const allImages = Products.find().select("images")

    Products.findById(req.params.id,
        (err, doc) => {
            if (!err) {
                Category.find().select("catName sub_category status")
                    .exec()
                    .then(docs => {

                        res.render('./seller/products/edit-product', { images: allImages, catsData: docs, productData: doc, sellerID: req.session.sellerID, pFname: req.session.pFname, pLname: req.session.pLname });

                    })
            } else {
                res.send('try-again')
            }

        })
});


router.post("/edit-product/:productID", imgUpload, (req, res) => {
    const id = req.params.productID

    Products.findById(id, (err, doc) => {
        if (!err) {

            var imageArr = [];
            doc.images.forEach((element) => {
                imageArr.push(element).toString();
            });

            var rawSS = req.files.images;
            if (rawSS) {            //Check if image is selected in choose image field and push it in array
                rawSS.forEach((element) => {
                    imageArr.push((element.path).toString().substring(6));
                });
            }
            console.log(imageArr)
        }

        Products.findByIdAndUpdate({ _id: id }, {
            $set: {
                images: imageArr,
                productName: req.body.productName,
                description: req.body.description,
                category: req.body.category,
                subcategory: req.body.subcategory,
                sizes: req.body.sizes,
                colours: req.body.colours,
                brand: req.body.brand,
                actualPrice: req.body.actualPrice,
                discount: req.body.discount,
                finalPrice: req.body.finalPrice,
                quantity: req.body.quantity,
                status: "Pending"
            }
        })
            .exec()
            .then(result => {
                console.log(result)
                res.redirect("/seller/products")
            })
            .catch(err => {
                console.log(err)
                res.status(500).json({
                    error: err
                })
            })
    });
});


router.get("/delete-product/(:id)", (req, res, next) => {
    Products.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            
            doc.images.forEach(element => {

                fs.unlinkSync("\public" + element)
                
            }
            );

            res.redirect('/seller/products');
        } else {
            res.send("Error Occurred. Please try again!")
        }
    })
});


router.get("/delete-image/(:id)/(:a)", (req, res, next) => {
    console.log('Delete')
    const index = req.params.a

    Products.findById(req.params.id, (err, doc) => {
        if (!err) {
            fs.unlinkSync("\public" + doc.images[index])

            doc.images.splice(index, 1)
            console.log(doc.images)

            Products.findByIdAndUpdate({ _id: req.params.id }, {
                $set: {
                    images: doc.images
                }
            })
                .exec()
                .then(result => {
                    console.log(result)
                    res.redirect("/seller/products/edit-product/" + req.params.id);
                })
        }
    });
});

module.exports = router