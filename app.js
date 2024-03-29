const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");

const errorMiddleware = require("./middleware/error");
const upload = require("./middleware/fileUpload");

// require("dotenv").config();

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
// app.use(fileUpload({ useTempFiles: true }));

// app.post("/uploads", upload.array("file"), (req, res) => {
//   console.log(req.files);
//   res.send(req.files);
// });
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.get("/getImages/:image", (req, res) => {
    res.sendFile(__dirname + `/uploads/${req.params.image}`);
});
const invoiceCronJob = require("./controllers/invoiceCronJob");

// Route Imports
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");
const payment = require("./routes/paymentRoute");
const category = require("./routes/categoryRoute");
const address = require("./routes/addressRoute");
const vender = require("./routes/venderRoute");
const coupon = require("./routes/couponRoute");
const cart = require("./routes/cartRoutes");
const notify = require("./routes/notification");
const driver = require("./routes/driver_Router");
const banner = require("./routes/banner");
const help = require("./routes/helpandsupport");
const terms = require("./routes/terms");
const policy = require("./routes/policy");
const offer = require("./routes/offerroute");
const card = require("./routes/cardRoute");
const wallet = require('./routes/wallet');
const faq = require('./routes/faq.route');
const static = require('./routes/static.route');

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);
app.use("/api/v1", offer);
app.use("/api/v1", category);
app.use("/api/v1", card);
app.use("/api/v1", address);
app.use("/api/v1/vender", vender);
app.use("/api/v1/coupon", coupon);
app.use("/api/v1/cart", cart);
app.use("/api/v1/driver", driver);
app.use("/api/v1/notify", notify);
app.use("/api/v1/banner", banner);
app.use("/api/v1/help", help);
app.use("/api/v1/terms", terms);
app.use("/api/v1/privacy", policy);
app.use('/api/v1/wallet', wallet);
app.use('/api/v1/wallet', wallet);
app.use('/api/v1/faq', faq);

app.use('/api/v1/static', static);
app.use(errorMiddleware);

module.exports = app;
