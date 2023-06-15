const Wallet = require('../models/wallet');
const transaction = require('../models/transactionModel');


exports.addMoney = async (req, res) => {
  if (!req.user._id) {
    return res.status(500).json({ message: "Provide Token " })
  }
  const wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) {
    const findWallet = await Wallet.create({ user: req.user._id, balance: parseInt(req.body.balance) });
    let obj = {
      user: req.user._id,
      date: Date.now(),
      amount: req.body.balance,
      type: "Credit",
    };
    const data = await transaction.create(obj);
    if (data) {
      res.status(200).json({ status: "success", data: findWallet });
    }
  } else {
    wallet.balance = parseInt(wallet.balance) + parseInt(req.body.balance);
    console.log(wallet.balance);
    const w = await wallet.save();
    let obj = {
      user: req.user._id,
      date: Date.now(),
      amount: req.body.balance,
      type: "Credit",
    };
    const data = await transaction.create(obj);
    if (data) {
      res.status(200).json({ status: "success", data: w })
    }
  }
};
exports.removeMoney = async (req, res) => {
  if (!req.user._id) {
    return res.status(500).json({message: "Provide Token "})
  }
  const wallet = await Wallet.findOne({ user: req.user._id });
  console.log(wallet);
  wallet.balance = parseInt(wallet.balance) - parseInt(req.body.balance);
  const w = await wallet.save();
  if (w) {
    let obj = {
      user: req.user._id,
      date: Date.now(),
      amount: req.body.balance,
      type: "Debit",
    };
    const data = await transaction.create(obj);
    if (data) {
      res.status(200).json({status: "success",data: w,});
    }
  }
};
exports.getWallet = async (req, res) => {
  try {
    if (!req.user._id) {
      return res.status(500).json({
        message: "Provide Token "
      })
    }
    const wall = await Wallet.findOne({ user: req.user._id })
    console.log(wall)
    res.status(200).json({
      status: "success",
      data: wall,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message
    })
  }
};
