const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const paymentCard = require("../models/paymentCard");
const { singleFileHandle } = require("../utils/fileHandle");

exports.createPaymentCard = catchAsyncErrors(async (req, res, next) => {
    const data = {
        user: req.user._id,
        number: req.body.number,
        month: req.body.month,
        year: req.body.year,
        cvv: req.body.cvv,
        cardType: req.body.cardType,
    };
    const Save = await paymentCard.create(data);
    res.status(201).json({ success: true, Save });
});

exports.getPaymentCard = catchAsyncErrors(async (req, res, next) => {
    const categories = await paymentCard.find({});
    res.status(201).json({
        success: true,
        categories,
    });
});
exports.updatePaymentCard = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const payment = await paymentCard.findById(id);
    if (!payment) new ErrorHander("Payment card Not Found !", 400);
    let product = await payment.findByIdAndUpdate(
        id,
        {
            number: req.body.number || payment.number,
            month: req.body.month || payment.month,
            year: req.body.year || payment.year,
            cvv: req.body.cvv || payment.cvv,
            cardType: req.body.cardType || payment.cardType,
        },
        { new: true }
    );
    res.status(200).json({ message: "Updated Successfully" });
});

exports.DeletePaymentCard = catchAsyncErrors(async (req, res, next) => {
    try {
        const data = await paymentCard.findByIdAndDelete({
            _id: req.params.id,
        });
        res.status(200).json({
            message: "Deleted",
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
});
