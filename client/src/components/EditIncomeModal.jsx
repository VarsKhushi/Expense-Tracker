import { useState, useEffect } from 'react';
import { X, DollarSign, Tag, Calendar, FileText } from 'lucide-react';

const incomeCategories = [
  'Salary',
  'Business',
  'Investments',
  'Gifts',
  'Other',
];

const EditIncomeModal = ({ income, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Salary',
    description: '',
    date: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (income) {
      setFormData({
        amount: income.amount,
        category: income.category,
        description: income.description,
        date: new Date(income.date).toISOString().split('T')[0],
      });
    }
  }, [income]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="text-lg font-bold">Edit Income</h2>
          <button onClick={onClose} className="close-btn">
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="number"
                name="amount"
                min="0"
                required
                className="input-field pl-10"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Category</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                name="category"
                className="input-field pl-10"
                value={formData.category}
                onChange={handleChange}
              >
                {incomeCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Description</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                name="description"
                required
                className="input-field pl-10"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                maxLength={200}
              />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                name="date"
                required
                className="input-field pl-10"
                value={formData.date}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex justify-center items-center">
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditIncomeModal;
