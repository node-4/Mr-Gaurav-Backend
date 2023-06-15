const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  OrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  invoiceNumber: {
    type: String,
    required: true
  },
  invoiceDate: {
    type: Date,
  },
  orderStatus: {
    type: String,
  },
  amount: {
    type: Number,
    default: 0,
    required: true
  },
  status: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Invoice', invoiceSchema);