import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PortfolioList = () => {
  const [trades, setTrades] = useState([]);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/trades/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTrades(response.data);
      } catch (err) {
        console.error('Error fetching trades:', err);
        setError('Failed to load portfolio');
      }
    };

    fetchTrades();
  }, [token]);

  // ✅ Delete handler
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this trade?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8000/api/trades/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTrades((prev) => prev.filter((trade) => trade.id !== id));
      alert('Trade deleted successfully.');
    } catch (err) {
      console.error('Error deleting trade:', err);
      alert('Failed to delete trade');
    }
  };

  // ✅ Sell handler
  const handleSell = async (id) => {
    const sellPrice = prompt('Enter sell price:');
    if (!sellPrice || isNaN(sellPrice)) return alert('Invalid price');

    try {
      const response = await axios.patch(
        `http://localhost:8000/api/trades/sell/${id}/`,
        { sell_price: parseFloat(sellPrice) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedTrade = response.data;
      setTrades((prev) =>
        prev.map((trade) => (trade.id === id ? updatedTrade : trade))
      );
    } catch (err) {
      console.error('Error selling trade:', err);
      alert('Sell failed');
    }
  };

  // ✅ Calculate profit/loss for each trade
  const calculatePL = (trade) => {
    if (!trade.sell_price) return null;
    const profit = (trade.sell_price - trade.purchase_price) * trade.quantity;
    return profit.toFixed(2);
  };

  // ✅ Totals
  const totalValue = trades.reduce(
    (acc, trade) => acc + trade.quantity * trade.purchase_price,
    0
  );

  const totalPL = trades.reduce((acc, trade) => {
    if (!trade.sell_price) return acc;
    return acc + (trade.sell_price - trade.purchase_price) * trade.quantity;
  }, 0);

  return (
    <div className="mt-4">
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
                    <button
                      className="btn btn-sm btn-success me-2"
                      onClick={() => handleSell(trade.id)}
                    >
                      💰 Sell
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(trade.id)}
                  >
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
                <strong>Total P/L: </strong>${totalPL.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
};

export default PortfolioList;
