import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BuyStockForm from './BuyStockForm';

const PortfolioList = ({ refresh, setRefresh }) => {
  const [trades, setTrades] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/trades/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrades(response.data);
      } catch (err) {
        console.error('Error fetching trades:', err);
        setError('Failed to load portfolio');
      }
    };

    fetchTrades();
  }, [token, refresh]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trade?')) return;

    try {
      await axios.delete(`http://localhost:8000/api/trades/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRefresh((prev) => !prev);
      alert('Trade deleted successfully.');
    } catch (err) {
      console.error('Error deleting trade:', err);
      alert('Failed to delete trade');
    }
  };

  const handleSell = async (id) => {
    const sellPrice = prompt('Enter sell price:');
    if (!sellPrice || isNaN(sellPrice)) return alert('Invalid price');

    try {
      await axios.patch(
        `http://localhost:8000/api/trades/sell/${id}/`,
        { sell_price: parseFloat(sellPrice) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRefresh((prev) => !prev);
    } catch (err) {
      console.error('Error selling trade:', err);
      alert('Sell failed');
    }
  };

  const calculatePL = (trade) => {
    if (!trade.sell_price) return null;
    const profit = (trade.sell_price - trade.purchase_price) * trade.quantity;
    return profit.toFixed(2);
  };

  const totalValue = trades.reduce(
    (acc, trade) => acc + trade.quantity * trade.purchase_price,
    0
  );

  const totalPL = trades.reduce((acc, trade) => {
    if (!trade.sell_price) return acc;
    return acc + (trade.sell_price - trade.purchase_price) * trade.quantity;
  }, 0);

  // ROI %
  const roi = totalValue > 0 ? ((totalPL / totalValue) * 100).toFixed(2) : 0;

  // Simulated Balance
  let simulatedBalance = 10000;
  trades.forEach(trade => {
    const purchaseCost = trade.quantity * trade.purchase_price;
    simulatedBalance -= purchaseCost;

    if (trade.sell_price) {
      const saleValue = trade.quantity * trade.sell_price;
      const profit = saleValue - purchaseCost;
      simulatedBalance += profit;
    }
  });

  // Total Sold Value
  const totalSold = trades.reduce((acc, trade) => {
    if (trade.sell_price) {
      return acc + (trade.sell_price * trade.quantity);
    }
    return acc;
  }, 0);

  return (
    <div className="mt-4">
      <BuyStockForm onTradeSuccess={() => setRefresh((prev) => !prev)} />
      <h4>📊 My Portfolio</h4>
      {error && <p className="text-danger">{error}</p>}
      {trades.length === 0 ? (
        <p>No trades yet.</p>
      ) : (
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Purchase Price</th>
              <th>Sell Price</th>
              <th>P/L</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className={trade.sell_price ? 'table-secondary' : ''}>
                <td>{trade.symbol}</td>
                <td>{trade.quantity}</td>
                <td>${parseFloat(trade.purchase_price).toFixed(2)}</td>
                <td>{trade.sell_price ? `$${parseFloat(trade.sell_price).toFixed(2)}` : '-'}</td>
                <td>{calculatePL(trade) || '-'}</td>
                <td>{new Date(trade.date_bought).toLocaleString()}</td>
                <td>{trade.sell_price ? 'Closed' : 'Open'}</td>
                <td>
                  {!trade.sell_price && (
                    <button className="btn btn-sm btn-success me-2" onClick={() => handleSell(trade.id)}>
                      💰 Sell
                    </button>
                  )}
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(trade.id)}>
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="8" className="text-end">
                <strong>Total Invested: </strong>${totalValue.toFixed(2)}<br />
                <strong>Total P/L: </strong>${totalPL.toFixed(2)}<br />
                <strong>ROI: </strong>{roi}%<br />
                <strong>Simulated Balance: </strong>${simulatedBalance.toFixed(2)}<br />
                <strong>Total Sold Value: </strong>${totalSold.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
};

export default PortfolioList;

