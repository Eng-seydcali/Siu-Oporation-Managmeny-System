import express from 'express';
import Budget from '../models/Budget.js';
import AcademicYear from '../models/AcademicYear.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   POST api/budgets
// @desc    Create a new budget
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { academicYearId, items } = req.body;

    // Check if active academic year exists
    const academicYear = await AcademicYear.findById(academicYearId);
    if (!academicYear) {
      return res.status(404).json({ msg: 'Academic year not found' });
    }

    if (!academicYear.isActive) {
      return res.status(400).json({ msg: 'Can only create budgets for the active academic year' });
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    const budget = new Budget({
      academicYear: academicYearId,
      user: req.user.id,
      items: items.map(item => ({
        itemName: item.itemName,
        quantity: item.quantity,
        price: item.price,
        amount: item.quantity * item.price
      })),
      totalAmount
    });

    const savedBudget = await budget.save();
    
    // Populate the saved budget with user and academic year data
    const populatedBudget = await Budget.findById(savedBudget._id)
      .populate('academicYear', 'year')
      .populate('user', 'name department');

    res.json(populatedBudget);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/budgets
// @desc    Get all user budgets
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id })
      .populate('academicYear', 'year')
      .populate('user', 'name department')
      .sort({ createdAt: -1 });
    res.json(budgets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/budgets/all
// @desc    Get all budgets (admin only)
// @access  Admin
router.get('/all', adminAuth, async (req, res) => {
  try {
    const budgets = await Budget.find()
      .populate('academicYear', 'year')
      .populate('user', 'name department')
      .sort({ createdAt: -1 });

    // Filter out any budgets with missing user data
    const validBudgets = budgets.filter(budget => budget.user && budget.user.department);
    res.json(validBudgets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/budgets/:id
// @desc    Get budget by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id)
      .populate('academicYear', 'year')
      .populate('user', 'name department');
    
    if (!budget) {
      return res.status(404).json({ msg: 'Budget not found' });
    }
    
    // Check if user owns the budget or is admin
    if (budget.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(budget);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/budgets/:id/approve-item
// @desc    Approve a budget item (admin only)
// @access  Admin
router.put('/:id/approve-item/:itemId', adminAuth, async (req, res) => {
  try {
    const { approvedQuantity } = req.body;
    
    const budget = await Budget.findById(req.params.id)
      .populate('academicYear', 'year')
      .populate('user', 'name department');
    
    if (!budget) {
      return res.status(404).json({ msg: 'Budget not found' });
    }
    
    // Find the item in the budget
    const item = budget.items.id(req.params.itemId);
    
    if (!item) {
      return res.status(404).json({ msg: 'Budget item not found' });
    }
    
    // Update the item
    item.approvedQuantity = approvedQuantity;
    item.status = 'approved';
    
    // Check if all items are approved to update budget status
    const allApproved = budget.items.every(item => item.status === 'approved');
    const anyApproved = budget.items.some(item => item.status === 'approved');
    
    if (allApproved) {
      budget.status = 'approved';
    } else if (anyApproved) {
      budget.status = 'partially_approved';
    }
    
    await budget.save();
    res.json(budget);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/budgets/:id/status
// @desc    Update budget status (admin only)
// @access  Admin
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const budget = await Budget.findById(req.params.id)
      .populate('academicYear', 'year')
      .populate('user', 'name department');
    
    if (!budget) {
      return res.status(404).json({ msg: 'Budget not found' });
    }
    
    budget.status = status;
    
    // If rejecting the budget, reject all items
    if (status === 'rejected') {
      budget.items.forEach(item => {
        item.status = 'rejected';
      });
    }
    
    await budget.save();
    res.json(budget);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;