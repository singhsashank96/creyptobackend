const Project = require('../models/project.model');
const multer = require('multer');
const path = require('path');


exports.createProject = async (req, res) => {
  const {
    name,
    type,
    description,
    address,
    location,
    cost,
    startDate,
    completeDate,
    status
  } = req.body;

  try {
    const project = await Project.create({
      name,
      type,
      description,
      address,
      location,
      cost,
      startDate,
      completeDate,
      status,
      owner: req.user.id
    });
    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating project' });
  }
};


exports.getProjects = async (req, res) => {
  try {
    const { userId } = req.params;

    const projects = await Project.find({ owner: userId })
      .populate('owner', 'name email');

    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getProjectsByType = async (req, res) => {
  const { type } = req.params;
  const projects = await Project.find({ type });
  res.json(projects);
};

exports.deleteProject = async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (project) res.json({ message: 'Project deleted' });
  else res.status(404).json({ message: 'Project not found' });
};


exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updatableFields = [
      'name',
      'projectNumber',
      'siteName',
      'ward',
      'head',
      'sancationNumberDate',
      'sor',
      'timeLimit',
      'officerInch',
      'sancationAmount',
      'estimateAggrement',
      'type',
      'description',
      'address',
      'location',
      'cost',
      'startDate',
      'completeDate',
      'status',
      'owner',
      'attachment' // added here
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });

    const updatedProject = await project.save();

    res.status(200).json({
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ message: 'Server error while updating project' });
  }
};



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // make sure 'uploads' folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Controller
  exports.uploadImage  =async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(200).json({
    message: 'File uploaded successfully',
    url: fileUrl
  });
};


