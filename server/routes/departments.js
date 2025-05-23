import express from 'express';
import Department from '../models/Department.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// @route   POST api/departments
// @desc    Create a new department
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if department already exists
    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
      return res.status(400).json({ msg: 'Department already exists' });
    }

    const department = new Department({
      name,
      description,
      createdBy: req.user.id
    });

    const savedDepartment = await department.save();
    res.json(savedDepartment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/departments
// @desc    Get all departments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .sort({ name: 1 });
    res.json(departments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/departments/user
// @desc    Get departments created by user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const departments = await Department.find({ 
      createdBy: req.user.id,
      isActive: true 
    }).sort({ name: 1 });
    res.json(departments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/departments/:id
// @desc    Update department
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    
    const department = await Department.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });
    
    if (!department) {
      return res.status(404).json({ msg: 'Department not found or unauthorized' });
    }
    
    if (name) department.name = name;
    if (description !== undefined) department.description = description;
    if (isActive !== undefined) department.isActive = isActive;
    
    await department.save();
    res.json(department);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/departments/:id
// @desc    Delete department (soft delete)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const department = await Department.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });
    
    if (!department) {
      return res.status(404).json({ msg: 'Department not found or unauthorized' });
    }
    
    department.isActive = false;
    await department.save();
    
    res.json({ msg: 'Department removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;