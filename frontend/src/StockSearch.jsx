import React, { useState } from 'react';
import axios from 'axios';

const StockSearch = ({ token, watchlist, setWatchlist }) => {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [addMessage, setAddMessage] = useState('');

  const handleSearch = async () => {
    if (!symbol.trim()) {
      setError('Please enter a stock symbol.');
      setStockData(null);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setStockData(null);
      setAddMessage('');

      const response = await axios.get(`/api/stocks/search/?symbol=${symbol}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ Search success:', response.data);
      setStockData(response.data);
    } catch (error) {
      console.error('❌ Search error:', error.response?.data || error.message);
      setError(
        error.response?.status === 401
          ? 'Authentication failed. Please log in again.'
          : error.response?.data?.error || 'Stock not found or invalid symbol'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!stockData?.symbol) return;

    try {
      const response = await axios.post(
        '/api/stocks/watchlist/',
        { symbol: stockData.symbol },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('✅ Added to watchlist:', response.data);
      setAddMessage(`Added ${stockData.symbol} to watchlist.`);
      setError('');
      if (typeof setWatchlist === 'function') {
        const updatedList = await axios.get('/api/stocks/watchlist/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setWatchlist(updatedList.data);
      }
    } catch (error) {
      console.error('❌ Add to watchlist error:', error.response?.data || error.message);
      setError('Failed to add to watchlist');
    }
  };

  // ✅ Check if current stock is already in watchlist
  const isAlreadyInWatchlist =
    stockData &&
    watchlist?.some(
      (item) => item.symbol.toUpperCase() === stockData.symbol.toUpperCase()
    );

  return (
    <div className="p-3 border rounded bg-light">
      <h3 className="mb-3">Stock Search</h3>
      <div className="mb-2 d-flex gap-2">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter stock symbol"
          className="form-control"
        />
        <button onClick={handleSearch} className="btn btn-primary" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <p className="text-danger">{error}</p>}
      {addMessage && <p className="text-success">{addMessage}</p>}

      {stockData && (
        <div className="mt-3">
          <h4>{stockData.symbol}</h4>
          <ul className="list-group mb-2">
            <li className="list-group-item"><strong>Price:</strong> ${stockData.price}</li>
            <li className="list-group-item"><strong>Open:</strong> ${stockData.open}</li>
            <li className="list-group-item"><strong>High:</strong> ${stockData.high}</li>
            <li className="list-group-item"><strong>Low:</strong> ${stockData.low}</li>
            <li className="list-group-item"><strong>Volume:</strong> {stockData.volume}</li>
            <li className="list-group-item"><strong>Previous Close:</strong> ${stockData.previous_close}</li>
            <li className="list-group-item"><strong>Change:</strong> {stockData.change} ({stockData.change_percent})</li>
            <li className="list-group-item"><strong>Latest Trading Day:</strong> {stockData.latest_trading_day}</li>
          </ul>

          {!isAlreadyInWatchlist ? (
            <button className="btn btn-outline-success" onClick={handleAddToWatchlist}>
              ➕ Add to Watchlist
            </button>
          ) : (
            <span className="badge bg-success">✔️ Already in Watchlist</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StockSearch;



