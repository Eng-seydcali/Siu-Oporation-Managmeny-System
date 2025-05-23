import express from 'express';
import User from '../models/User.js';
import Department from '../models/Department.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/users
// @desc    Get all users in user's departments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Get departments created by user
    const departments = await Department.find({ createdBy: req.user.id });
    const departmentNames = departments.map(dept => dept.name);

    // Get users in those departments
    const users = await User.find({
      department: { $in: departmentNames }
    }).select('-password');
    
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/:id
// @desc    Get user by ID (if in user's department)
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if user belongs to one of the requester's departments
    const departments = await Department.find({ createdBy: req.user.id });
    const departmentNames = departments.map(dept => dept.name);

    if (!departmentNames.includes(user.department)) {
      return res.status(401).json({ msg: 'Not authorized to view this user' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/:id
// @desc    Update user (if in user's department)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, email, department } = req.body;
  
  try {
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if user belongs to one of the requester's departments
    const departments = await Department.find({ createdBy: req.user.id });
    const departmentNames = departments.map(dept => dept.name);

    if (!departmentNames.includes(user.department)) {
      return res.status(401).json({ msg: 'Not authorized to update this user' });
    }

    // If department is being changed, verify new department is valid
    if (department && !departmentNames.includes(department)) {
      return res.status(400).json({ msg: 'Invalid department selection' });
    }
    
    // Update user fields
    const userFields = {};
    if (name) userFields.name = name;
    if (email) userFields.email = email;
    if (department) userFields.department = department;
    
    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: userFields },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/users/:id
// @desc    Delete user (if in user's department)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if user belongs to one of the requester's departments
    const departments = await Department.find({ createdBy: req.user.id });
    const departmentNames = departments.map(dept => dept.name);

    if (!departmentNames.includes(user.department)) {
      return res.status(401).json({ msg: 'Not authorized to delete this user' });
    }
    
    await user.deleteOne();
    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;