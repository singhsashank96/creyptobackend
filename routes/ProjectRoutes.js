const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectsByType,
  deleteProject , uploadImage , updateProject 
} = require('../controllers/ProjectController');
const { protect } = require('../middleware/authMiddileWare');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); // <-- correct path
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post('/', protect, createProject);
router.get('/:userId', getProjects);
router.get('/type/:type', getProjectsByType);
router.delete('/:id', protect, deleteProject);
router.post('/uploadImage',upload.single('file'), uploadImage);

router.patch('/:id', updateProject);


module.exports = router;
