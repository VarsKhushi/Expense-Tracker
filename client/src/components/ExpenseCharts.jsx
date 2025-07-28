import { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ExpenseCharts = ({ categoryData = [], monthlyData = [], showOnlyLine = false, showOnlyPie = false }) => {
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);
  
  console.log('ExpenseCharts - categoryData:', categoryData);
  console.log('ExpenseCharts - monthlyData:', monthlyData);

  // Process category data for the pie chart
  const processCategoryData = (data) => {
    if (!Array.isArray(data) || data.length === 0) return [];
    
    // Ensure consistent data structure and filter out invalid entries
    return data
      .map(item => ({
        _id: item?._id || 'Uncategorized',
        total: item?.total || 0,
        count: item?.count || 0
      }))
      .filter(item => item.total > 0); // Only include categories with positive totals
  };

  const processedCategoryData = processCategoryData(categoryData || []);
  
  // Generate colors for categories
  const generateColors = (count) => {
    const baseColors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#F43F5E'
    ];
    
    // If we have more categories than base colors, generate additional colors
    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    }
    
    // Generate additional colors if needed
    const additionalColors = [];
    for (let i = baseColors.length; i < count; i++) {
      const hue = (i * 137.508) % 360; // Golden angle approximation
      additionalColors.push(`hsl(${hue}, 70%, 60%)`);
    }
    
    return [...baseColors, ...additionalColors];
  };
  
  const pieChartData = {
    labels: processedCategoryData.map(item => item._id),
    datasets: [
      {
        data: processedCategoryData.map(item => item.total),
        backgroundColor: generateColors(processedCategoryData.length),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };
  
  console.log('Category Data for Pie Chart:', {
    rawData: categoryData,
    processedData: processedCategoryData,
    chartData: pieChartData
  });

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            return `${context.label}: ₹${context.parsed.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${((context.parsed / total) * 100).toFixed(1)}%)`;
          },
        },
      },
    },
  };

  // Process monthly data for the chart
  const processMonthlyData = (data) => {
    if (!Array.isArray(data) || data.length === 0) return [];
    
    // Ensure each item has the expected structure
    const validatedData = data.map(item => ({
      _id: {
        month: item?._id?.month || new Date().getMonth() + 1,
        year: item?._id?.year || new Date().getFullYear()
      },
      total: item?.total || 0
    }));
    
    // Sort by year and month
    return [...validatedData].sort((a, b) => {
      if (a._id.year !== b._id.year) {
        return a._id.year - b._id.year;
      }
      return a._id.month - b._id.month;
    });
  };

  const processedMonthlyData = processMonthlyData(monthlyData || []);
  
  // Prepare chart data
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const barChartData = {
    labels: processedMonthlyData.map(item => {
      return `${monthNames[item._id.month - 1]} ${item._id.year}`;
    }),
    datasets: [
      {
        label: 'Monthly Expenses',
        data: processedMonthlyData.map(item => item.total),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };
  
  console.log('Monthly Data for Chart:', {
    rawData: monthlyData,
    processedData: processedMonthlyData,
    chartData: barChartData
  });

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `₹${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          },
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 4,
      },
    },
  };

  // Determine which charts to show
  const shouldShowPieChart = !showOnlyLine && categoryData?.length > 0;
  const shouldShowBarChart = !showOnlyPie && monthlyData?.length > 0;

  // If no charts should be shown, display a message
  if (!shouldShowPieChart && !shouldShowBarChart) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No data available for charts
      </div>
    );
  }

  return (
    <div className="h-full w-full" style={{ position: 'relative', height: '100%', width: '100%' }}>
      {shouldShowPieChart && (
        <div className="h-full w-full" style={{ position: 'relative', height: '100%', width: '100%' }}>
          <Pie 
            data={pieChartData} 
            options={pieChartOptions} 
            ref={pieChartRef} 
            style={{ display: 'block', height: '100%', width: '100%' }}
          />
        </div>
      )}
      
      {shouldShowBarChart && (
        <div className="h-full w-full" style={{ position: 'relative', height: '100%', width: '100%' }}>
          <Bar 
            data={barChartData} 
            options={barChartOptions} 
            ref={barChartRef}
            style={{ display: 'block', height: '100%', width: '100%' }}
          />
        </div>
      )}
    </div>
  );
};

export default ExpenseCharts; 