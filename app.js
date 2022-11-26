const express = require("express");
const http = require("http");
const session = require("express-session");
const dotenv = require("dotenv");
dotenv.config();
var mongoose = require("mongoose");

const port = process.env.PORT;
const app = express();

const adminRoute = require("./api/routes/admin/admin");
const verificationRoute = require("./api/routes/admin/verification");
const admincategoryRoute = require("./api/routes/admin/category");
const adminsubcategoryRoute = require("./api/routes/admin/sub-category");

const sellerRoute = require("./api/routes/seller/seller");
const sellerProductRoute = require("./api/routes/seller/product");
const productVariantRoute = require("./api/routes/seller/variant");
const sellerGalleryRoute = require("./api/routes/seller/gallery");
const sellerCoverageRoute = require("./api/routes/seller/coverage");
const sellerPromoteRoute = require("./api/routes/seller/promote");
const sellerNotifyRoute = require("./api/routes/seller/notifications");

const orderRoute = require("./api/routes/seller/orders");
const userLoginRoute = require("./api/routes/user/user-login");
const userRoute = require("./api/routes/user/user");
const userCartRoute = require("./api/routes/user/cart");
const userWishlistRoute = require("./api/routes/user/wishlist");
const userSubscribeRoute = require("./api/routes/user/subscription");
const userProductRoute = require("./api/routes/user/product");
const userSellerRoute = require("./api/routes/user/seller-profile");
const userCheckoutRoute = require("./api/routes/user/checkout");
const userAccountRoute = require("./api/routes/user/account");
const userReviewRoute = require("./api/routes/user/review");
const userOrdersRoute = require("./api/routes/user/orders");
const userNotifyRoute = require("./api/routes/user/notifications");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true,
    })
);

mongoose.connect(
    "mongodb+srv://entwicklera:" +
    process.env.MONGO_PASS +
    "@cluster0.ns4yy5i.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    keepAlive: true,
    useUnifiedTopology: true,
}
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("views", "./views");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/css", express.static(__dirname + "public/css"));
app.use("/js", express.static(__dirname + "public/js"));
app.use("/img", express.static(__dirname + "public/img"));
app.use("/font", express.static(__dirname + "public/font"));
app.use("/vendor", express.static(__dirname + "public/vendor"));
app.use("/components", express.static(__dirname + "public/components"));
app.use("/uploads", express.static(__dirname + "public/uploads"));

app.use("/admin", adminRoute);
app.use("/admin/verification", verificationRoute);
app.use("/admin/category", admincategoryRoute);
app.use("/admin/sub-category", adminsubcategoryRoute);

app.use("/seller", sellerRoute);
app.use("/seller/products", sellerProductRoute);
app.use("/seller/gallery", sellerGalleryRoute);
app.use("/seller/products/variant", productVariantRoute);
app.use("/seller/coverage", sellerCoverageRoute);
app.use("/seller/promote", sellerPromoteRoute);
app.use("/seller/orders", orderRoute);
app.use("/seller/notifications", sellerNotifyRoute);

app.use("/", userRoute);
app.use("/product", userProductRoute);
app.use("/seller", userSellerRoute);
app.use("/cart", userCartRoute);
app.use("/wishlist", userWishlistRoute);
app.use("/subscription", userSubscribeRoute);
app.use("/login", userLoginRoute);
app.use("/checkout", userCheckoutRoute);
app.use("/account", userAccountRoute);
app.use("/review", userReviewRoute);
app.use("/orders", userOrdersRoute);
app.use("/notifications", userNotifyRoute);

const server = http.createServer(app);
server.listen(port, () => {
    console.log("Listening on port " + port);
});