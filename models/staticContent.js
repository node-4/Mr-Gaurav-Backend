const mongoose = require('mongoose');
const staticContent = mongoose.Schema({
    desc: {
        type: String
    },
    type: {
        type: String,
        default: "ABOUTUS"
    },
})
module.exports = mongoose.model('staticContent', staticContent);