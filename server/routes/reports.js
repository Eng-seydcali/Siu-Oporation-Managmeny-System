import express from 'express';
import Budget from '../models/Budget.js';
import Request from '../models/Request.js';
import Emergency from '../models/Emergency.js';
import AcademicYear from '../models/AcademicYear.js';
import User from '../models/User.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/reports/user-summary
// @desc    Get summary report of user's budgets, requests, and emergencies
// @access  Private
router.get('/user-summary', auth, async (req, res) => {
  try {
    // Get active academic year
    const activeYear = await AcademicYear.findOne({ isActive: true });
    
    if (!activeYear) {
      return res.status(404).json({ msg: 'No active academic year found' });
    }

    // Get user's budgets
    const budgets = await Budget.find({
      user: req.user.id,
      academicYear: activeYear._id
    });

    // Get user's requests
    const requests = await Request.find({
      user: req.user.id,
      budget: { $in: budgets.map(b => b._id) }
    });

    // Get user's emergencies
    const emergencies = await Emergency.find({
      user: req.user.id,
      academicYear: activeYear._id
    });

    // Calculate summary data
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.totalAmount, 0);
    const approvedBudget = budgets.reduce((sum, budget) => {
      if (budget.status === 'approved' || budget.status === 'partially_approved') {
        return sum + budget.items.reduce((itemSum, item) => {
          if (item.status === 'approved') {
            return itemSum + (item.price * item.approvedQuantity);
          }
          return itemSum;
        }, 0);
      }
      return sum;
    }, 0);

    const pendingBudget = budgets.reduce((sum, budget) => {
      if (budget.status === 'pending' || budget.status === 'partially_approved') {
        return sum + budget.items.reduce((itemSum, item) => {
          if (item.status === 'pending') {
            return itemSum + item.amount;
          }
          return itemSum;
        }, 0);
      }
      return sum;
    }, 0);

    const totalRequests = requests.reduce((sum, request) => sum + request.totalAmount, 0);
    const totalEmergencies = emergencies.reduce((sum, emergency) => sum + emergency.amount, 0);

    const report = {
      academicYear: activeYear.year,
      totalBudget,
      approvedBudget,
      pendingBudget,
      totalRequests,
      totalEmergencies,
      budgetCount: budgets.length,
      requestCount: requests.length,
      emergencyCount: emergencies.length,
      budgetsByStatus: {
        approved: budgets.filter(b => b.status === 'approved').length,
        partiallyApproved: budgets.filter(b => b.status === 'partially_approved').length,
        pending: budgets.filter(b => b.status === 'pending').length,
        rejected: budgets.filter(b => b.status === 'rejected').length
      },
      requestsByStatus: {
        approved: requests.filter(r => r.status === 'approved').length,
        partiallyApproved: requests.filter(r => r.status === 'partially_approved').length,
        pending: requests.filter(r => r.status === 'pending').length,
        rejected: requests.filter(r => r.status === 'rejected').length
      },
      emergenciesByStatus: {
        approved: emergencies.filter(e => e.status === 'approved').length,
        pending: emergencies.filter(e => e.status === 'pending').length,
        rejected: emergencies.filter(e => e.status === 'rejected').length
      }
    };

    res.json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/reports/admin-summary
// @desc    Get summary report of all budgets, requests, and emergencies (admin only)
// @access  Admin
router.get('/admin-summary', adminAuth, async (req, res) => {
  try {
    const { department } = req.query;
    
    // Get active academic year
    const activeYear = await AcademicYear.findOne({ isActive: true });
    
    if (!activeYear) {
      return res.status(404).json({ msg: 'No active academic year found' });
    }
    
    // Build query based on department filter
    const query = { academicYear: activeYear._id };
    if (department && department !== 'all') {
      // Find users in the department
      const departmentUsers = await User.find({ department });
      query.user = { $in: departmentUsers.map(u => u._id) };
    }
    
    // Get filtered budgets with populated user data
    const budgets = await Budget.find(query)
      .populate('user', 'name department')
      .populate('academicYear', 'year');
    
    // Filter out budgets with missing user data
    const validBudgets = budgets.filter(budget => budget.user && budget.user.department);
    
    // Get filtered requests
    const requests = await Request.find({
      budget: { $in: validBudgets.map(b => b._id) }
    }).populate('user', 'name department');
    
    // Get filtered emergencies
    const emergencies = await Emergency.find({
      academicYear: activeYear._id,
      ...(department && department !== 'all' ? { 'user.department': department } : {})
    }).populate('user', 'name department');
    
    // Get user count for department
    const users = await User.find(
      department && department !== 'all' ? { department } : {}
    );
    
    // Calculate summary data
    const totalBudget = validBudgets.reduce((sum, budget) => sum + budget.totalAmount, 0);
    const approvedBudget = validBudgets.reduce((sum, budget) => {
      if (budget.status === 'approved' || budget.status === 'partially_approved') {
        return sum + budget.items.reduce((itemSum, item) => {
          if (item.status === 'approved') {
            return itemSum + (item.price * item.approvedQuantity);
          }
          return itemSum;
        }, 0);
      }
      return sum;
    }, 0);
    
    const pendingBudget = validBudgets.reduce((sum, budget) => {
      if (budget.status === 'pending' || budget.status === 'partially_approved') {
        return sum + budget.items.reduce((itemSum, item) => {
          if (item.status === 'pending') {
            return itemSum + item.amount;
          }
          return itemSum;
        }, 0);
      }
      return sum;
    }, 0);
    
    const totalRequests = requests.reduce((sum, request) => sum + request.totalAmount, 0);
    const totalEmergencies = emergencies.reduce((sum, emergency) => sum + emergency.amount, 0);
    
    // Group by department
    const departments = {};
    validBudgets.forEach(budget => {
      const dept = budget.user.department;
      if (!departments[dept]) {
        departments[dept] = {
          totalBudget: 0,
          approvedBudget: 0,
          pendingBudget: 0,
          budgetCount: 0,
          budgets: [],
          users: users.filter(u => u.department === dept)
        };
      }
      
      departments[dept].budgets.push(budget);
      departments[dept].totalBudget += budget.totalAmount;
      departments[dept].budgetCount += 1;
      
      if (budget.status === 'approved' || budget.status === 'partially_approved') {
        budget.items.forEach(item => {
          if (item.status === 'approved') {
            departments[dept].approvedBudget += (item.price * item.approvedQuantity);
          } else if (item.status === 'pending') {
            departments[dept].pendingBudget += item.amount;
          }
        });
      } else if (budget.status === 'pending') {
        departments[dept].pendingBudget += budget.totalAmount;
      }
    });
    
    const report = {
      academicYear: activeYear.year,
      userCount: users.length,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        department: user.department,
        email: user.email
      })),
      totalBudget,
      approvedBudget,
      pendingBudget,
      totalRequests,
      totalEmergencies,
      budgetCount: validBudgets.length,
      requestCount: requests.length,
      emergencyCount: emergencies.length,
      budgetsByStatus: {
        approved: validBudgets.filter(b => b.status === 'approved').length,
        partiallyApproved: validBudgets.filter(b => b.status === 'partially_approved').length,
        pending: validBudgets.filter(b => b.status === 'pending').length,
        rejected: validBudgets.filter(b => b.status === 'rejected').length
      },
      requestsByStatus: {
        approved: requests.filter(r => r.status === 'approved').length,
        partiallyApproved: requests.filter(r => r.status === 'partially_approved').length,
        pending: requests.filter(r => r.status === 'pending').length,
        rejected: requests.filter(r => r.status === 'rejected').length
      },
      emergenciesByStatus: {
        approved: emergencies.filter(e => e.status === 'approved').length,
        pending: emergencies.filter(e => e.status === 'pending').length,
        rejected: emergencies.filter(e => e.status === 'rejected').length
      },
      departments
    };
    
    res.json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;