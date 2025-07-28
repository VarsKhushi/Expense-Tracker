import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expenses.js';
import incomeRoutes from './routes/income.js';
import exportAllRoutes from './routes/exportAll.js';

dotenv.config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/export', exportAllRoutes);

// Make sure the uploads directory is accessible
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Expense Tracker API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 