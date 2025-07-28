import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js';
import Expense from '../models/Expense.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Get all expenses for user
router.get('/', async (req, res) => {
  try {
    const { category, startDate, endDate, sortBy = 'date', sortOrder = 'desc' } = req.query;
    
    let query = { userId: req.user._id };
    
    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const expenses = await Expense.find(query)
      .sort(sortOptions)
      .limit(100);
    
    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new expense
router.post('/add', [
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('category').isIn(['Food', 'Travel', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Transport', 'Other']).withMessage('Invalid category'),
  body('description').trim().isLength({ min: 1, max: 200 }).withMessage('Description must be between 1 and 200 characters'),
  body('date').optional().isISO8601().withMessage('Invalid date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, category, description, date } = req.body;
    
    const expense = new Expense({
      amount,
      category,
      description,
      date: date || new Date(),
      userId: req.user._id
    });
    
    await expense.save();
    
    res.status(201).json({
      message: 'Expense added successfully',
      expense
    });
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an expense by ID
router.put('/:id', [
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('category').isIn(['Food', 'Travel', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Transport', 'Other']).withMessage('Invalid category'),
  body('description').trim().isLength({ min: 1, max: 200 }).withMessage('Description must be between 1 and 200 characters'),
  body('date').optional().isISO8601().withMessage('Invalid date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { amount, category, description, date } = req.body;
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { amount, category, description, date },
      { new: true }
    );
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense updated successfully', expense });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get expense summary
router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    console.log('SUMMARY QUERY:', { startDate, endDate, category });
    
    let dateFilter = {};
    if ((startDate && startDate !== '') || (endDate && endDate !== '')) {
      dateFilter.date = {};
      if (startDate && startDate !== '') dateFilter.date.$gte = new Date(startDate);
      if (endDate && endDate !== '') dateFilter.date.$lte = new Date(endDate);
    }
    console.log('SUMMARY DATE FILTER:', dateFilter);
    
    // Get current date and calculate first/last day of current and last month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-based
    
    // Calculate first and last day of current month
    const firstDayCurrentMonth = new Date(currentYear, currentMonth - 1, 1);
    const lastDayCurrentMonth = new Date(currentYear, currentMonth, 0);
    
    // Calculate first and last day of last month
    const firstDayLastMonth = new Date(currentYear, currentMonth - 2, 1);
    const lastDayLastMonth = new Date(currentYear, currentMonth - 1, 0);
    
    // Total expenses
    const totalExpenses = await Expense.aggregate([
      { $match: { userId: req.user._id, ...dateFilter } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Current month expenses
    const currentMonthExpenses = await Expense.aggregate([
      { 
        $match: { 
          userId: req.user._id,
          date: { $gte: firstDayCurrentMonth, $lte: lastDayCurrentMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Last month expenses
    const lastMonthExpenses = await Expense.aggregate([
      { 
        $match: { 
          userId: req.user._id,
          date: { $gte: firstDayLastMonth, $lte: lastDayLastMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Category-wise expenses
    const categoryExpenses = await Expense.aggregate([
      { $match: { userId: req.user._id, ...dateFilter } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);
    
    // Monthly expenses (last 6 months)
    const monthlyExpenses = await Expense.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);
    
    console.log('Server - Monthly expenses:', JSON.stringify(monthlyExpenses, null, 2));
    
    // Daily expenses (last 30 days)
    const dailyExpenses = await Expense.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
      { $limit: 30 }
    ]);
    
    res.json({
      totalExpenses: totalExpenses[0]?.total || 0,
      currentMonthExpenses: currentMonthExpenses[0]?.total || 0,
      lastMonthExpenses: lastMonthExpenses[0]?.total || 0,
      categoryExpenses,
      monthlyExpenses,
      dailyExpenses
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
});

// Delete an expense by ID
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

import ExcelJS from 'exceljs';

// Export expenses to Excel
router.get('/export', async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;
    let query = { userId: req.user._id };
    if (category && category !== 'All') query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const expenses = await Expense.find(query).sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Expenses');
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Category', key: 'category', width: 18 },
      { header: 'Amount', key: 'amount', width: 12 },
      { header: 'Description', key: 'description', width: 30 }
    ];
    expenses.forEach(exp => {
      worksheet.addRow({
        date: exp.date ? new Date(exp.date).toLocaleDateString('en-IN') : '',
        category: exp.category,
        amount: exp.amount,
        description: exp.description
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Failed to export expenses', error: error.message });
  }
});

export default router; 