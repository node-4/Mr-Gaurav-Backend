const mongoose = require('mongoose');

const refundRequest = mongoose.Schema({
        user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                require: false
        },
        orderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Order",
                require: true
        },
        orderReturnId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "orderreturn",
                require: true
        },
        status: {
                type: String,
                enum: ["Pending", "Accept", "Reject"],
                default: "Pending"
        }
})

const refundRequest1 = mongoose.model('refundRequest', refundRequest);
module.exports = refundRequest1