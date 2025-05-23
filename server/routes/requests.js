import express from 'express';
import Request from '../models/Request.js';
import Budget from '../models/Budget.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   POST api/requests
// @desc    Create a new request
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { budgetId, items } = req.body;

    // Check if budget exists and is approved
    const budget = await Budget.findById(budgetId);
    if (!budget) {
      return res.status(404).json({ msg: 'Budget not found' });
    }

    if (budget.status !== 'approved' && budget.status !== 'partially_approved') {
      return res.status(400).json({ msg: 'Can only create requests for approved budgets' });
    }

    // Validate that user owns the budget
    if (budget.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Validate items against approved budget items
    for (const item of items) {
      const budgetItem = budget.items.id(item.budgetItemId);
      
      if (!budgetItem) {
        return res.status(400).json({ msg: `Item ${item.itemName} not found in budget` });
      }
      
      if (budgetItem.status !== 'approved') {
        return res.status(400).json({ msg: `Item ${item.itemName} is not approved in budget` });
      }
      
      // Check if requested quantity exceeds approved quantity
      const previousRequests = await Request.find({ 
        budget: budgetId,
        'items.budgetItem': item.budgetItemId,
        status: { $in: ['approved', 'pending'] }
      });
      
      const previouslyRequestedQty = previousRequests.reduce((total, req) => {
        const matchingItems = req.items.filter(i => 
          i.budgetItem.toString() === item.budgetItemId
        );
        return total + matchingItems.reduce((sum, i) => sum + i.quantity, 0);
      }, 0);
      
      const availableQty = budgetItem.approvedQuantity - previouslyRequestedQty;
      
      if (item.quantity > availableQty) {
        return res.status(400).json({ 
          msg: `Requested quantity for ${item.itemName} exceeds available approved quantity. Available: ${availableQty}` 
        });
      }
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    const request = new Request({
      budget: budgetId,
      user: req.user.id,
      items: items.map(item => ({
        budgetItem: item.budgetItemId,
        itemName: item.itemName,
        quantity: item.quantity,
        price: item.price,
        amount: item.quantity * item.price
      })),
      totalAmount
    });

    const savedRequest = await request.save();
    res.json(savedRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/requests
// @desc    Get all user requests
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const requests = await Request.find({ user: req.user.id })
      .populate('budget', 'budgetId')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/requests/all
// @desc    Get all requests (admin only)
// @access  Admin
router.get('/all', adminAuth, async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('budget', 'budgetId')
      .populate('user', 'name department')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/requests/:id
// @desc    Get request by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('budget', 'budgetId')
      .populate('user', 'name department');
    
    // Check if request exists
    if (!request) {
      return res.status(404).json({ msg: 'Request not found' });
    }
    
    // Check if user owns the request or is admin
    if (request.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/requests/:id/status
// @desc    Update request status (admin only)
// @access  Admin
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, items } = req.body;
    
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ msg: 'Request not found' });
    }
    
    // Update overall status
    request.status = status;
    
    // Update individual items if provided
    if (items && items.length > 0) {
      items.forEach(updateItem => {
        const item = request.items.id(updateItem.itemId);
        if (item) {
          item.status = updateItem.status;
        }
      });
    } else if (status) {
      // If only overall status provided, update all items
      request.items.forEach(item => {
        item.status = status;
      });
    }
    
    await request.save();
    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;