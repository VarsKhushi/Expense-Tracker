import express from 'express';
import { auth } from '../middleware/auth.js';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import ExcelJS from 'exceljs';

const router = express.Router();
router.use(auth);

// Combined export for both income and expenses
router.get('/all', async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;
    let expenseQuery = { userId: req.user._id };
    let incomeQuery = { userId: req.user._id };
    if (category && category !== 'All') {
      expenseQuery.category = category;
      incomeQuery.category = category;
    }
    if (startDate || endDate) {
      expenseQuery.date = {};
      incomeQuery.date = {};
      if (startDate) {
        expenseQuery.date.$gte = new Date(startDate);
        incomeQuery.date.$gte = new Date(startDate);
      }
      if (endDate) {
        expenseQuery.date.$lte = new Date(endDate);
        incomeQuery.date.$lte = new Date(endDate);
      }
    }
    const expenses = await Expense.find(expenseQuery).sort({ date: -1 });
    const incomes = await Income.find(incomeQuery).sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();
    // Expenses Sheet
    const expenseSheet = workbook.addWorksheet('Expenses');
    expenseSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Category', key: 'category', width: 18 },
      { header: 'Amount', key: 'amount', width: 12 },
      { header: 'Description', key: 'description', width: 30 }
    ];
    expenses.forEach(exp => {
      expenseSheet.addRow({
        date: exp.date ? new Date(exp.date).toLocaleDateString('en-IN') : '',
        category: exp.category,
        amount: exp.amount,
        description: exp.description
      });
    });
    // Income Sheet
    const incomeSheet = workbook.addWorksheet('Income');
    incomeSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Category', key: 'category', width: 18 },
      { header: 'Amount', key: 'amount', width: 12 },
      { header: 'Description', key: 'description', width: 30 }
    ];
    incomes.forEach(inc => {
      incomeSheet.addRow({
        date: inc.date ? new Date(inc.date).toLocaleDateString('en-IN') : '',
        category: inc.category,
        amount: inc.amount,
        description: inc.description
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=all_transactions.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Failed to export all transactions', error: error.message });
  }
});

export default router;
