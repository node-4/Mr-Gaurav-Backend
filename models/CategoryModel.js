const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name Category Required"],
    },
    categoryType: {
        type: String,
        enum: ["Electronics", "Grocery"],
    },
    image: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("Category", categorySchema);
