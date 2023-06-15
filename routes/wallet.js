const express = require('express')
const walletContrallers = require("../controllers/wallet");
const isAuth = require('../middleware/auth')


const router = express();

router.post('/add', isAuth.isAuthenticatedUser,walletContrallers.addMoney);
router.post('/remove',isAuth.isAuthenticatedUser, walletContrallers.removeMoney);
router.get('/getwallet',isAuth.isAuthenticatedUser, walletContrallers.getWallet);
module.exports = router ; 