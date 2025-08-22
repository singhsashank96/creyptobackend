const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  register,
  login,
  getUsers,
  getUserById,
  updateUser,
  updateProfilePicOnly , resetPassword , coinDetails , getReferralLink
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddileWare');

// Auth routes
router.post('/register', register);
router.post('/resetpass', resetPassword);
router.post('/login', login);
router.get('/coinDetails', coinDetails);
router.get('/referral/link', getReferralLink);

// User management
router.get('/', getUsers);
router.get('/:id', getUserById);   // <-- move this to bottom

module.exports = router;
