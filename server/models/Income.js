import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Salary', 'Business', 'Investments', 'Gifts', 'Other']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: 200
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

incomeSchema.index({ userId: 1, date: -1 });
incomeSchema.index({ userId: 1, category: 1 });

export default mongoose.model('Income', incomeSchema);
