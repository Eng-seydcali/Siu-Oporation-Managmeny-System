import express from 'express';
import AcademicYear from '../models/AcademicYear.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   POST api/academic-years
// @desc    Create a new academic year
// @access  Admin only
router.post('/', adminAuth, async (req, res) => {
  try {
    const { year, startDate, endDate, isActive } = req.body;

    // Check if academic year already exists
    const existingYear = await AcademicYear.findOne({ year });
    if (existingYear) {
      return res.status(400).json({ msg: 'Academic year already exists' });
    }

    // If new year is active, deactivate all other years
    if (isActive) {
      await AcademicYear.updateMany({}, { isActive: false });
    }

    const academicYear = new AcademicYear({
      year,
      startDate,
      endDate,
      isActive,
      createdBy: req.user.id
    });

    const savedYear = await academicYear.save();
    res.json(savedYear);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/academic-years
// @desc    Get all academic years
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const academicYears = await AcademicYear.find().sort({ createdAt: -1 });
    res.json(academicYears);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/academic-years/active
// @desc    Get active academic year
// @access  Private
router.get('/active', auth, async (req, res) => {
  try {
    const activeYear = await AcademicYear.findOne({ isActive: true });
    
    if (!activeYear) {
      return res.status(404).json({ msg: 'No active academic year found' });
    }
    
    res.json(activeYear);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/academic-years/:id
// @desc    Update academic year
// @access  Admin only
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { year, startDate, endDate, isActive } = req.body;
    
    // If setting as active, deactivate all other years
    if (isActive) {
      await AcademicYear.updateMany({}, { isActive: false });
    }
    
    const academicYear = await AcademicYear.findByIdAndUpdate(
      req.params.id,
      { year, startDate, endDate, isActive },
      { new: true }
    );
    
    if (!academicYear) {
      return res.status(404).json({ msg: 'Academic year not found' });
    }
    
    res.json(academicYear);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/academic-years/:id
// @desc    Delete academic year
// @access  Admin only
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const academicYear = await AcademicYear.findById(req.params.id);
    
    if (!academicYear) {
      return res.status(404).json({ msg: 'Academic year not found' });
    }
    
    await academicYear.deleteOne();
    res.json({ msg: 'Academic year removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;