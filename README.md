# Expense Tracker App

A full-stack expense tracking application built with React, Node.js, Express, and MongoDB. Features user authentication, expense management, and beautiful visualizations.

## Features

### User Features
- ✅ User Registration/Login with JWT authentication
- ✅ Add/Edit/Delete Expenses
- ✅ Categorize expenses (Food, Travel, Rent, etc.)
- ✅ Filter by date, category, amount
- ✅ Monthly summary and statistics
- ✅ Visual graphs:
  - Pie chart (category-wise distribution)
  - Bar chart (monthly trends)
- ✅ Responsive design with Tailwind CSS

### Tech Stack

**Frontend:**
- React 19 + Vite
- Tailwind CSS for styling
- Chart.js for data visualization
- React Router for navigation
- Axios for API calls
- React Hot Toast for notifications
- Lucide React for icons

**Backend:**
- Node.js + Express.js
- JWT-based authentication
- MongoDB with Mongoose
- Express Validator for input validation
- bcryptjs for password hashing

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Expense-Tracker
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**
   
   Create `server/config.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/expense-tracker
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

5. **Start MongoDB**
   
   Make sure MongoDB is running on your system or use MongoDB Atlas.

6. **Run the application**

   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd client
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login

### Expenses
- `GET /api/expenses` - Get all expenses (with filters)
- `POST /api/expenses/add` - Add new expense
- `GET /api/expenses/:id` - Get single expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/summary` - Get expense summary and charts data

## Usage

1. **Register/Login**: Create an account or sign in with existing credentials
2. **Add Expenses**: Click "Add Expense" button to add new expenses
3. **View Dashboard**: See your expense summary, charts, and recent transactions
4. **Filter & Search**: Use filters to view expenses by category or date range
5. **Edit/Delete**: Click the edit or delete icons to modify expenses
6. **View Charts**: Analyze your spending patterns with interactive charts

## Project Structure

```
Expense-Tracker/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context
│   │   ├── services/       # API services
│   │   └── ...
│   ├── package.json
│   └── ...
├── server/                 # Backend Node.js app
│   ├── models/            # Mongoose models
│   ├── routes/            # Express routes
│   ├── middleware/        # Custom middleware
│   ├── config.env         # Environment variables
│   ├── server.js          # Main server file
│   └── package.json
└── README.md
```

## Features in Detail

### Authentication
- Secure JWT-based authentication
- Password hashing with bcryptjs
- Protected routes on both frontend and backend
- Automatic token refresh and logout on expiration

### Expense Management
- Full CRUD operations for expenses
- Category-based organization
- Date-based filtering
- Amount validation
- Real-time updates

### Data Visualization
- Interactive pie chart showing category distribution
- Bar chart displaying monthly spending trends
- Color-coded categories for easy identification
- Responsive charts that work on all devices

### User Experience
- Modern, responsive design with Tailwind CSS
- Toast notifications for user feedback
- Loading states and error handling
- Intuitive navigation and forms
- Mobile-friendly interface

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Happy Expense Tracking! 💰📊** 