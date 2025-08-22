// routes/walletRoutes.js
const express = require("express");
const { createWallet, depositMoney, withdrawMoney, getWallet , buyCoins , getCoins, } = require("../controllers/walletController");
// const { protect } = require("../middleware/authMiddleware"); // JWT auth middleware
const {createPayment}= require('../controllers/paymentcontroller');

const router = express.Router();

router.post("/deposit", depositMoney);
router.post("/buyCoins", buyCoins);
router.get("/getCoins/:userId", getCoins);

router.post("/withdrawMoney", withdrawMoney);
router.get("/getBallance/:userId", getWallet);
router.post("/createpay", createPayment);

module.exports = router;
