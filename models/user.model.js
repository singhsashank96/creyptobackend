const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String },
  mobile: { type: Number, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: '' },
  otp: { type: Number },

  // Referral system
referralCode: { type: String, unique: true },  // code user shares
invetationCode: { type: String },              // code used at signup
coins: { type: Number, default: 0 },           // referral bonus balance        // Bonus coins balance

  role: { type: String, enum: ['admin', 'user'], default: 'user' } , 
firstDepositDone: { type: Boolean, default: false }

}, { timestamps: true });

// Hash password
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
