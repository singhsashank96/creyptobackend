// models/Wallet.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ["deposit", "withdraw"], required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  coin: { type: String, required: true },       // e.g., BTC, ETH
  amount: { type: Number, required: true },     // Amount in rupees spent
  unit: { type: Number, required: true },       // Units of coin bought
  lockupTime: { type: Date, required: true },   // When coins can be unlocked
  createdAt: { type: Date, default: Date.now }
});




const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  balance: { type: Number, default: 0 },  // Single balance in rupees
  transactions: [
    {
      type: { type: String, enum: ["deposit", "withdraw" , 'referral-bonus'], required: true },
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Wallet", walletSchema);