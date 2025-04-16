import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const PortfolioChart = ({ refresh }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/trades/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data;

        // Group trades by date and calculate total value
        const valueByDate = {};

        data.forEach(trade => {
          const date = new Date(trade.date_bought).toLocaleDateString();
          const value = trade.quantity * parseFloat(trade.purchase_price);
          valueByDate[date] = (valueByDate[date] || 0) + value;
        });

        const chartArray = Object.entries(valueByDate).map(([date, totalValue]) => ({
          date,
          totalValue,
        }));

        setChartData(chartArray);
      } catch (err) {
        console.error('Error fetching chart data:', err);
      }
    };

    fetchTrades();
  }, [refresh]);

  return (
    <div className="mt-4">
      <h4>📈 Portfolio Value Over Time</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="totalValue" stroke="#007bff" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioChart;
