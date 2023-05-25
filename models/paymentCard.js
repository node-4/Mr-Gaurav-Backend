const mongoose = require("mongoose");

const Schema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    number: {
        type: String,
    },
    month: {
        type: String,
    },
    year: {
        type: String,
    },
    cvv: {
        type: String,
    },
    cardType: {
        type: String,
        enum: ["Debit", "Credit"],
    },
});

const banner = mongoose.model("banner", Schema);

module.exports = banner;
