import express from 'express';
import multer from 'multer';
import Emergency from '../models/Emergency.js';
import AcademicYear from '../models/AcademicYear.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @route   POST api/emergencies
// @desc    Create a new emergency request
// @access  Private
router.post('/', auth, upload.single('mediaFile'), async (req, res) => {
  try {
    const { title, description, amount } = req.body;

    // Check if active academic year exists
    const academicYear = await AcademicYear.findOne({ isActive: true });
    if (!academicYear) {
      return res.status(404).json({ msg: 'No active academic year found' });
    }

    const emergency = new Emergency({
      title,
      description,
      amount,
      user: req.user.id,
      academicYear: academicYear._id
    });

    // If a file was uploaded, add it to the emergency
    if (req.file) {
      emergency.mediaFile = req.file.buffer;
      emergency.contentType = req.file.mimetype;
    }

    const savedEmergency = await emergency.save();
    res.json(savedEmergency);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/emergencies
// @desc    Get all user emergencies
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const emergencies = await Emergency.find({ user: req.user.id })
      .populate('academicYear', 'year')
      .sort({ createdAt: -1 });
    res.json(emergencies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/emergencies/all
// @desc    Get all emergencies (admin only)
// @access  Admin
router.get('/all', adminAuth, async (req, res) => {
  try {
    const emergencies = await Emergency.find()
      .populate('academicYear', 'year')
      .populate('user', 'name department')
      .sort({ createdAt: -1 });
    res.json(emergencies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/emergencies/:id
// @desc    Get emergency by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id)
      .populate('academicYear', 'year')
      .populate('user', 'name department');
    
    if (!emergency) {
      return res.status(404).json({ msg: 'Emergency request not found' });
    }
    
    if (emergency.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(emergency);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/emergencies/:id/media
// @desc    Get emergency media file
// @access  Private
router.get('/:id/media', auth, async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    
    if (!emergency || !emergency.mediaFile) {
      return res.status(404).json({ msg: 'Media not found' });
    }
    
    res.set('Content-Type', emergency.contentType);
    res.send(emergency.mediaFile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/emergencies/:id/status
// @desc    Update emergency status (admin only)
// @access  Admin
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const emergency = await Emergency.findById(req.params.id);
    
    if (!emergency) {
      return res.status(404).json({ msg: 'Emergency request not found' });
    }
    
    emergency.status = status;
    await emergency.save();
    
    res.json(emergency);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;