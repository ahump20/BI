import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  Line,
  Bar,
  Doughnut,
  Radar,
  Pie
} from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsChart = ({
  type = 'line',
  data,
  options = {},
  height = 400,
  className = ''
}) => {
  const chartRef = useRef(null);

  // Default options for consistent styling across all charts
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(250, 250, 250, 0.8)',
          font: {
            family: 'Inter, sans-serif',
            size: 12
          },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(20, 33, 61, 0.95)',
        titleColor: '#BF5700',
        bodyColor: 'rgba(250, 250, 250, 0.9)',
        borderColor: 'rgba(191, 87, 0, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 12
      }
    },
    scales: type === 'line' || type === 'bar' ? {
      x: {
        ticks: {
          color: 'rgba(250, 250, 250, 0.7)',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(191, 87, 0, 0.1)',
          drawBorder: false
        }
      },
      y: {
        ticks: {
          color: 'rgba(250, 250, 250, 0.7)',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(191, 87, 0, 0.1)',
          drawBorder: false
        }
      }
    } : type === 'radar' ? {
      r: {
        angleLines: {
          color: 'rgba(191, 87, 0, 0.2)'
        },
        grid: {
          color: 'rgba(191, 87, 0, 0.2)'
        },
        pointLabels: {
          color: 'rgba(250, 250, 250, 0.8)',
          font: {
            size: 12
          }
        },
        ticks: {
          color: 'rgba(250, 250, 250, 0.6)',
          backdropColor: 'transparent',
          font: {
            size: 10
          }
        }
      }
    } : {},
    interaction: {
      intersect: false,
      mode: 'index'
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  // Merge provided options with defaults
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options.plugins
    }
  };

  // Enhanced data processing for better styling
  const processedData = React.useMemo(() => {
    if (!data) return null;

    const processed = { ...data };

    // Apply consistent color scheme if not provided
    if (processed.datasets) {
      processed.datasets = processed.datasets.map((dataset, index) => {
        const colors = [
          '#BF5700', // Burnt Orange
          '#9E1B32', // Crimson
          '#003087', // Navy
          '#461D7C', // Purple
          '#BA0C2F', // Red
          '#FF8200', // Orange
          '#14213D'  // Dark Navy
        ];

        const baseColor = colors[index % colors.length];

        return {
          ...dataset,
          borderColor: dataset.borderColor || baseColor,
          backgroundColor: dataset.backgroundColor ||
            (type === 'line' ? `${baseColor}20` :
             type === 'radar' ? `${baseColor}40` :
             type === 'doughnut' || type === 'pie' ? colors.slice(0, dataset.data?.length || colors.length) :
             baseColor),
          borderWidth: dataset.borderWidth || (type === 'line' ? 3 : type === 'radar' ? 2 : 1),
          tension: type === 'line' ? (dataset.tension !== undefined ? dataset.tension : 0.4) : undefined,
          pointRadius: type === 'line' ? (dataset.pointRadius || 4) : undefined,
          pointHoverRadius: type === 'line' ? (dataset.pointHoverRadius || 6) : undefined,
          pointBackgroundColor: type === 'line' ? (dataset.pointBackgroundColor || baseColor) : undefined,
          pointBorderColor: type === 'line' ? (dataset.pointBorderColor || '#FFFFFF') : undefined,
          pointBorderWidth: type === 'line' ? (dataset.pointBorderWidth || 2) : undefined,
          fill: type === 'line' ? (dataset.fill !== undefined ? dataset.fill : false) : undefined
        };
      });
    }

    return processed;
  }, [data, type]);

  const renderChart = () => {
    if (!processedData) {
      return (
        <div
          style={{ height: `${height}px` }}
          className={`chart-placeholder ${className}`}
        >
          <div className="placeholder-content">
            <i className="fas fa-chart-line" style={{ fontSize: '2rem', color: '#BF5700', marginBottom: '1rem' }}></i>
            <p style={{ color: 'rgba(250, 250, 250, 0.6)', margin: 0 }}>No data available</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      data: processedData,
      options: mergedOptions,
      height: height,
      ref: chartRef
    };

    switch (type.toLowerCase()) {
      case 'line':
        return <Line {...commonProps} />;
      case 'bar':
        return <Bar {...commonProps} />;
      case 'doughnut':
        return <Doughnut {...commonProps} />;
      case 'pie':
        return <Pie {...commonProps} />;
      case 'radar':
        return <Radar {...commonProps} />;
      default:
        return <Line {...commonProps} />;
    }
  };

  useEffect(() => {
    // Cleanup function to destroy chart instance
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className={`analytics-chart-container ${className}`} style={{ height: `${height}px`, position: 'relative' }}>
      {renderChart()}

      <style jsx>{`
        .analytics-chart-container {
          width: 100%;
          position: relative;
          background: transparent;
        }

        .chart-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          background: rgba(191, 87, 0, 0.05);
          border: 2px dashed rgba(191, 87, 0, 0.2);
          border-radius: 12px;
        }

        .placeholder-content {
          text-align: center;
        }

        /* Custom scrollbar for overflow */
        .analytics-chart-container::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }

        .analytics-chart-container::-webkit-scrollbar-track {
          background: rgba(191, 87, 0, 0.1);
          border-radius: 2px;
        }

        .analytics-chart-container::-webkit-scrollbar-thumb {
          background: rgba(191, 87, 0, 0.3);
          border-radius: 2px;
        }

        .analytics-chart-container::-webkit-scrollbar-thumb:hover {
          background: rgba(191, 87, 0, 0.5);
        }

        /* Animation for chart entrance */
        .analytics-chart-container canvas {
          opacity: 0;
          animation: fadeInChart 1s ease-in-out forwards;
        }

        @keyframes fadeInChart {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .analytics-chart-container {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .analytics-chart-container {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsChart;