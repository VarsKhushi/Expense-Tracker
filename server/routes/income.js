import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js';
import Income from '../models/Income.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Get all income for user
router.get('/', async (req, res) => {
  try {
    const { category, startDate, endDate, sortBy = 'date', sortOrder = 'desc' } = req.query;
    let query = { userId: req.user._id };
    if (category && category !== 'All') query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    const incomes = await Income.find(query).sort(sortOptions).limit(100);
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new income
router.post('/add', [
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('category').isIn(['Salary', 'Business', 'Investments', 'Gifts', 'Other']).withMessage('Invalid category'),
  body('description').trim().isLength({ min: 1, max: 200 }).withMessage('Description must be between 1 and 200 characters'),
  body('date').optional().isISO8601().withMessage('Invalid date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { amount, category, description, date } = req.body;
    const income = new Income({ amount, category, description, date: date || new Date(), userId: req.user._id });
    await income.save();
    res.status(201).json({ message: 'Income added successfully', income });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update income
router.put('/:id', [
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('category').isIn(['Salary', 'Business', 'Investments', 'Gifts', 'Other']).withMessage('Invalid category'),
  body('description').trim().isLength({ min: 1, max: 200 }).withMessage('Description must be between 1 and 200 characters'),
  body('date').optional().isISO8601().withMessage('Invalid date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { amount, category, description, date } = req.body;
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { amount, category, description, date },
      { new: true }
    );
    if (!income) return res.status(404).json({ message: 'Income not found' });
    res.json({ message: 'Income updated successfully', income });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete income
router.delete('/:id', async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!income) return res.status(404).json({ message: 'Income not found' });
    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to get start and end of month
const getMonthRange = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
};

// Income summary
router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    let dateFilter = {};
    if ((startDate && startDate !== '') || (endDate && endDate !== '')) {
      dateFilter.date = {};
      if (startDate && startDate !== '') dateFilter.date.$gte = new Date(startDate);
      if (endDate && endDate !== '') dateFilter.date.$lte = new Date(endDate);
    }

    // Total income
    const totalIncome = await Income.aggregate([
      { $match: { userId: req.user._id, ...dateFilter } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Current month income
    const currentDate = new Date();
    const currentMonth = getMonthRange(currentDate);
    const currentMonthIncome = await Income.aggregate([
      { 
        $match: { 
          userId: req.user._id,
          date: { $gte: currentMonth.start, $lte: currentMonth.end }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Last month income
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonth = getMonthRange(lastMonthDate);
    const lastMonthIncome = await Income.aggregate([
      { 
        $match: { 
          userId: req.user._id,
          date: { $gte: lastMonth.start, $lte: lastMonth.end }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Category income
    const categoryIncome = await Income.aggregate([
      { $match: { userId: req.user._id, ...dateFilter } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    // Monthly income (last 6 months)
    const monthlyIncome = await Income.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    // Daily income (last 30 days)
    const dailyIncome = await Income.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' }, day: { $dayOfMonth: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
      { $limit: 30 }
    ]);

    // Recent income (last 10)
    const recentIncome = await Income.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(10)
      .lean();

    res.json({
      totalIncome: totalIncome[0]?.total || 0,
      currentMonthIncome: currentMonthIncome[0]?.total || 0,
      lastMonthIncome: lastMonthIncome[0]?.total || 0,
      categoryIncome,
      monthlyIncome,
      dailyIncome,
      recentIncome,
      // For backward compatibility
      totalExpenses: 0,
      categoryExpenses: [],
      monthlyExpenses: [],
      dailyExpenses: []
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
});

import ExcelJS from 'exceljs';

// Export income to Excel
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
    const incomes = await Income.find(query).sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Income');
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Category', key: 'category', width: 18 },
      { header: 'Amount', key: 'amount', width: 12 },
      { header: 'Description', key: 'description', width: 30 }
    ];
    incomes.forEach(inc => {
      worksheet.addRow({
        date: inc.date ? new Date(inc.date).toLocaleDateString('en-IN') : '',
        category: inc.category,
        amount: inc.amount,
        description: inc.description
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=income.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Failed to export income', error: error.message });
  }
});

export default router;
