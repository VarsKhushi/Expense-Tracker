import { useRef } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const IncomeCharts = ({ categoryData = [], monthlyData = [], showOnlyLine = false, showOnlyPie = false }) => {
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);

  const colors = [
    '#34d399', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa', 
    '#f472b6', '#38bdf8', '#facc15', '#4ade80', '#f472b6'
  ];

  // Pie chart for category-wise income
  const pieChartData = {
    labels: categoryData.map(item => item._id),
    datasets: [
      {
        data: categoryData.map(item => item.total),
        backgroundColor: colors.slice(0, categoryData.length),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10
    },
    plugins: {
      legend: {
        position: 'bottom',
        align: 'center',
        labels: {
          padding: 15,
          usePointStyle: true,
          boxWidth: 8,
          font: {
            size: 11
          }
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `₹${context.label}: ₹${context.parsed.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${percentage}%)`;
          },
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 1.5,
        borderColor: '#fff'
      }
    }
  };

  // Bar chart for monthly income
  const barChartData = {
    labels: monthlyData.map(item => {
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return `${monthNames[item._id.month - 1]} ${item._id.year}`;
    }).reverse(),
    datasets: [
      {
        label: 'Monthly Income',
        data: monthlyData.map(item => item.total).reverse(),
        backgroundColor: 'rgba(52, 211, 153, 0.8)',
        borderColor: 'rgba(52, 211, 153, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 15,
        right: 15
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.chart.data.labels[context.dataIndex];
            return `${label}: ₹${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          padding: 5
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false
        },
        ticks: {
          callback: function(value) {
            return '₹' + value.toFixed(0);
          },
          padding: 5
        },
      },
    },
  };

  if (categoryData.length === 0 && monthlyData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <p className="text-gray-500 text-sm">No data available for charts</p>
      </div>
    );
  }

  const showPieChart = !showOnlyLine && (!showOnlyPie || (showOnlyPie && categoryData?.length > 0));
  const showBarChart = !showOnlyPie && (!showOnlyLine || (showOnlyLine && monthlyData?.length > 0));

  if (!showPieChart && !showBarChart) {
    return (
      <div className="w-full h-full">
        {!showOnlyPie && monthlyData?.length > 0 && (
          <div className="w-full h-full p-2">
            <Bar 
              ref={barChartRef} 
              data={barChartData} 
              options={{
                ...barChartOptions,
                responsive: true,
                maintainAspectRatio: false
              }} 
            />
          </div>
        )}
        {!showOnlyLine && categoryData?.length > 0 && (
          <div className="w-full h-full">
            <Pie 
              ref={pieChartRef} 
              data={pieChartData} 
              options={{
                ...pieChartOptions,
                responsive: true,
                maintainAspectRatio: false
              }} 
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full space-y-8">
      {showBarChart && (
        <div className="w-full h-full p-2">
          <Bar 
            data={barChartData} 
            options={{
              ...barChartOptions,
              responsive: true,
              maintainAspectRatio: false
            }} 
            ref={barChartRef} 
          />
        </div>
      )}
      
      {showPieChart && (
        <div className="w-full h-full flex flex-col items-center justify-center" style={{ minHeight: '300px' }}>
          <div className="w-full max-w-xs h-full">
            <Pie 
              data={pieChartData} 
              options={{
                ...pieChartOptions,
                responsive: true,
                maintainAspectRatio: false
              }} 
              ref={pieChartRef} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeCharts;
