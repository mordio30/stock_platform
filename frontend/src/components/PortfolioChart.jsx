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

        let cumulativeValue = 10000; // Starting cash value (you can adjust this amount)
        const valueByDate = [];

        data.forEach(trade => {
          const dateObj = new Date(trade.date_bought);
          const date = `${dateObj.toLocaleDateString()} ${dateObj.getHours()}:00`;
          const purchaseValue = trade.quantity * parseFloat(trade.purchase_price);

          // Add purchase value to cumulative value
          cumulativeValue -= purchaseValue; // Subtract from cash balance when buying

          // If a stock is sold, calculate profit/loss
          if (trade.sell_price) {
            const sellValue = trade.quantity * parseFloat(trade.sell_price);
            const profitOrLoss = sellValue - purchaseValue; // This calculates the net gain/loss from the sale
            cumulativeValue += profitOrLoss; // Update cumulative portfolio value with profit/loss
          }

          // Push the data with the date and cumulative value
          valueByDate.push({ date, cumulativeValue });
        });

        // Sort chart data by date
        valueByDate.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Set chart data
        setChartData(valueByDate);
        
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
          <Line type="monotone" dataKey="cumulativeValue" stroke="#007bff" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioChart;
