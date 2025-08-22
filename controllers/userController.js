const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const axios = require("axios");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  console.log("call")
  const { name, mobile, password, role , otp , invetationCode } = req.body;
  try {
    const userExists = await User.findOne({ mobile });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, mobile, password, role , invetationCode: invetationCode ? invetationCode : "" , otp});
    res.status(201).json({ token: generateToken(user._id), user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { mobile, password } = req.body;
  try {
    const user = await User.findOne({ mobile });
    if (user && (await user.matchPassword(password))) {
      res.json({ token: generateToken(user._id), user });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.resetPassword = async (req, res) => {
  const { mobile, oldPassword, newPassword } = req.body;

  try {
    // 1. Find user by mobile
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Check old password
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // 3. Update to new password
    user.password = newPassword; // will get hashed by pre-save hook in model
    await user.save();

    // 4. Send success response
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) res.json(user);
  else res.status(404).json({ message: 'User not found' });
};

exports.updateUser = async (req, res) => {
  const profilePicFile = req.file;

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Loop through all allowed fields in schema
    const updatableFields = [
      'name',
      'email',
      'lastName',
      'dob',
      'gender',
      'maritalStatus',
      'homeWorkPhone',
      'preferrdCallTime',
      'identificationTime',
      'idNumber',
      'StateofIssue',
      'Student',
      'pensionReciver',
      'Smoker',
      'role',
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Update profile picture if file uploaded
    if (profilePicFile) {
      user.profilePic = `/uploads/${profilePicFile.filename}`;
    }

    // Handle password update separately so it gets hashed
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        lastName: updatedUser.lastName,
        dob: updatedUser.dob,
        gender: updatedUser.gender,
        maritalStatus: updatedUser.maritalStatus,
        homeWorkPhone: updatedUser.homeWorkPhone,
        preferrdCallTime: updatedUser.preferrdCallTime,
        identificationTime: updatedUser.identificationTime,
        idNumber: updatedUser.idNumber,
        StateofIssue: updatedUser.StateofIssue,
        Student: updatedUser.Student,
        pensionReciver: updatedUser.pensionReciver,
        Smoker: updatedUser.Smoker,
        role: updatedUser.role,
        profilePic: updatedUser.profilePic,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while updating user' });
  }
};


exports.updateProfilePicOnly = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profilePic = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({ message: 'Profile picture updated', profilePic: user.profilePic });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error uploading image' });
  }
};



exports.coinDetails = async (req, res) => {
  try {
    // const response = await axios.get(
    //   "https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
    //   {
    //     headers: {
    //       "X-CMC_PRO_API_KEY": "527f16fb-e68f-4dbf-8877-45a2b3887f33",
    //     },
    //   }
    // );

      const response = await axios.get(
      "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
      {
        headers: {
          "X-CMC_PRO_API_KEY": "527f16fb-e68f-4dbf-8877-45a2b3887f33",
        },
        params: {
          start: 1,      // Starting rank
          limit: 50,   // Max number of coins you want (free API has smaller limit)
          convert: "USD" // Get price in USD
        },
      }
    );

    // Send API response back to client
    res.json(response.data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getReferralLink = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // req.user from protect middleware
    if (!user) return res.status(404).json({ message: "User not found" });

    const referralLink = `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`;
    res.json({ referralLink });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



exports.firstDeposit = async (req, res) => {
  try {
    const { amount , userId } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    // ensure only first deposit triggers referral bonus
    if (!user.firstDepositDone) {
      user.firstDepositDone = true;
      await user.save();

      if (user.invetationCode) {
        const referrer = await User.findOne({ referralCode: user.invetationCode });
        if (referrer) {
          const bonus = amount * 0.10; // 10%
          referrer.coins += bonus;
          await referrer.save();
        }
      }
    }

    // TODO: Add your own wallet/deposit logic for the user
    res.json({ message: "Deposit successful", amount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

