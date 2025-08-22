// models/Wallet.js
const mongoose = require("mongoose");

const CoinPurchase = new mongoose.Schema({
  // type: { type: String, enum: ["deposit", "withdraw"], required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  coin: { type: String, required: true },       // e.g., BTC, ETH
  amount: { type: Number, required: true },     // Amount in rupees spent
  unit: { type: Number, required: true },       // Units of coin bought
  lockupTime: { type: String },   // When coins can be unlocked
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model("CoinPurchase", CoinPurchase);