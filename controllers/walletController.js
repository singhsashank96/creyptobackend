// controllers/walletController.js
const Wallet = require("../models/wallet.model");
const User = require("../models/user.model");

const CoinPurchase = require("../models/coin.model")
const mongoose = require("mongoose");


// Create wallet (when user registers or first time)
exports.createWallet = async (req, res) => {
  try {
    const wallet = new Wallet({ user: req.user._id });
    await wallet.save();
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.depositMoney = async (req, res) => {
  const { amount, userId } = req.body;

  try {
    // ✅ force number (if you want 2 decimals only, you can Math.round or toFixed on display)
    const amt = Number(amount);

    if (!Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find or create wallet
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = new Wallet({ user: userId, balance: 0, transactions: [] });
    }

    // ✅ ensure numeric add
    wallet.balance = Number(wallet.balance || 0) + amt;

    // Add transaction history (store as number)
    wallet.transactions.push({ type: "deposit", amount: amt });

    await wallet.save();

    // ✅ First deposit (referral bonus)
    if (!user.firstDepositDone) {
      user.firstDepositDone = true;
      await user.save();

      if (user.invetationCode) {
        // you’re storing referrer’s *userId* in invetationCode per your latest code
        const referrer = await User.findById(user.invetationCode);
        if (referrer) {
          const bonus = amt * 0.10; // 10% commission

          // Update referrer's coins (numeric)
          referrer.coins = Number(referrer.coins || 0) + bonus;
          await referrer.save();

          // ✅ Update referrer's wallet (numeric)
          let refWallet = await Wallet.findOne({ user: referrer._id });
          if (!refWallet) {
            refWallet = new Wallet({ user: referrer._id, balance: 0, transactions: [] });
          }

          refWallet.balance = Number(refWallet.balance || 0) + bonus;
          refWallet.transactions.push({ type: "referral-bonus", amount: bonus, from: userId });
          await refWallet.save();
        }
      }
    }

    res.json({
      message: "Deposit successful",
      balance: wallet.balance,
      transactions: wallet.transactions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};





// Withdraw coins
exports.withdrawMoney = async (req, res) => {
  const { amount , userId } = req.body;

  try {
    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    // Find wallet
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Check balance
    if (wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct balance
    wallet.balance -= amount;

    // Add transaction history
    wallet.transactions.push({ type: "withdraw", amount });

    await wallet.save();

    res.json({
      message: "Withdrawal successful",
      balance: wallet.balance,
      transactions: wallet.transactions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get wallet details
exports.getWallet = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    res.json(wallet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



exports.buyCoins = async (req, res) => {
  const { coin, amount, unit, lockupTime , userId } = req.body;

  try {
    // Validate request
    if (!coin || !amount || !unit || !lockupTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find user wallet
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Check balance
    if (wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct rupees from wallet
    wallet.balance -= amount;

    // Save transaction in wallet history
    wallet.transactions.push({ type: "withdraw", amount });

    await wallet.save();

    // Save coin purchase
    const purchase = new CoinPurchase({
      user:  userId,
      coin,
      amount,
      unit,
      lockupTime
    });
    await purchase.save();

    res.json({
      message: "Coin purchase successful",
      status:"Complete" ,
      walletBalance: wallet.balance,
      purchase
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



exports.getCoins = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find all purchases for this user
    const purchases = await CoinPurchase.find({ user: userId }).sort({ createdAt: -1 });

    if (!purchases || purchases.length == 0) {
      return res.status(404).json({ message: "No coin purchases found" });
    }

    res.json({
      message: "User coin purchases fetched successfully",
      purchases
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};