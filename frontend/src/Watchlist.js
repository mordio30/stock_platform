import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Watchlist = ({ watchlist, setWatchlist, token }) => {
  const [error, setError] = useState('');

  const fetchWatchlist = async () => {
    try {
      if (!token) {
        setError('Please log in to view your watchlist.');
        return;
      }

      const response = await axios.get('/api/stocks/watchlist/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(response.data)) {
        setWatchlist(response.data);
      } else {
        console.warn('Unexpected watchlist format:', response.data);
        setWatchlist([]);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error.response?.data || error.message);
      setError('Error fetching watchlist');
    }
  };

  const removeFromWatchlist = async (symbol) => {
    try {
      await axios.delete(`/api/stocks/watchlist/${symbol}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchWatchlist();
    } catch (error) {
      console.error('Error removing from watchlist:', error.response?.data || error.message);
      setError('Error removing from watchlist');
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, [token]); // ✅ Refetch when token changes

  return (
    <div>
      <h3>Watchlist</h3>
      {error && <p className="text-danger">{error}</p>}
      {Array.isArray(watchlist) && watchlist.length > 0 ? (
        <ul className="list-group">
          {watchlist.map((stock) => (
            <li key={stock.symbol} className="list-group-item d-flex justify-content-between align-items-center">
              {stock.symbol}
              <button className="btn btn-sm btn-outline-danger" onClick={() => removeFromWatchlist(stock.symbol)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        !error && <p className="text-muted">No stocks in your watchlist.</p>
      )}
    </div>
  );
};

export default Watchlist;



