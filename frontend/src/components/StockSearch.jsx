import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Sparklines, SparklinesLine } from 'react-sparklines';
import { fetchIntradayStock } from '../utils/fetchStockData';

const StockSearch = ({ token, watchlist, setWatchlist }) => {
  const location = useLocation();
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [addMessage, setAddMessage] = useState('');
  const [trendData, setTrendData] = useState(null);

  // 🔍 Parse query string like ?symbol=AAPL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlSymbol = params.get('symbol');
    if (urlSymbol) {
      setSymbol(urlSymbol.toUpperCase());
    }
  }, [location.search]);

  // 🔁 Auto-run search when symbol is set via URL
  useEffect(() => {
    if (symbol) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

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
      setTrendData(null);

      const response = await axios.get(`/api/stocks/search/?symbol=${symbol}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStockData(response.data);

      const trend = await fetchIntradayStock(symbol);
      setTrendData(trend?.trend?.length ? trend.trend : null);
    } catch (error) {
      console.error('Search error:', error.response?.data || error.message);
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddMessage(`✅ Added ${stockData.symbol} to watchlist.`);
      setError('');

      if (typeof setWatchlist === 'function') {
        const updatedList = await axios.get('/api/stocks/watchlist/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const sorted = updatedList.data.sort((a, b) => a.symbol.localeCompare(b.symbol));
        setWatchlist(sorted);
      }
    } catch (error) {
      console.error('Add to watchlist error:', error.response?.data || error.message);
      setError('❌ Failed to add to watchlist');
    }
  };

  const isAlreadyInWatchlist =
    stockData &&
    watchlist?.some(
      (item) => item.symbol.toUpperCase() === stockData.symbol.toUpperCase()
    );

  return (
    <div className="p-4 bg-white border rounded shadow-sm">
      <h3 className="mb-4 text-primary">📈 Stock Lookup</h3>

      <div className="input-group mb-3">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter symbol (e.g., AAPL)"
          className="form-control"
        />
        <button
          onClick={handleSearch}
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {addMessage && <div className="alert alert-success">{addMessage}</div>}

      {stockData && (
        <div className="card mt-4 shadow-sm">
          <div className="card-body">
            <h4 className="card-title">{stockData.symbol}</h4>
            <div className="row">
              <div className="col-md-6">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item"><strong>Price:</strong> ${stockData.price}</li>
                  <li className="list-group-item"><strong>Open:</strong> ${stockData.open}</li>
                  <li className="list-group-item"><strong>High:</strong> ${stockData.high}</li>
                  <li className="list-group-item"><strong>Low:</strong> ${stockData.low}</li>
                </ul>
              </div>
              <div className="col-md-6">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item"><strong>Volume:</strong> {stockData.volume}</li>
                  <li className="list-group-item"><strong>Prev Close:</strong> ${stockData.previous_close}</li>
                  <li className="list-group-item">
                    <strong>Change:</strong>{' '}
                    <span className={stockData.change >= 0 ? 'text-success' : 'text-danger'}>
                      {stockData.change} ({stockData.change_percent})
                    </span>
                  </li>
                  <li className="list-group-item"><strong>Latest Day:</strong> {stockData.latest_trading_day}</li>
                </ul>
              </div>
            </div>

            {/* 🎨 Sparkline Chart */}
            {trendData ? (
              <div className="mt-4">
                <strong>Recent Trend:</strong>
                <div className="sparkline-container mt-2 bg-light p-3 rounded">
                  <Sparklines data={trendData} width={200} height={60} margin={5}>
                    <SparklinesLine
                      color={stockData.change >= 0 ? '#28a745' : '#dc3545'}
                      style={{ fill: 'none', strokeWidth: 3 }}
                    />
                    <SparklinesLine
                      color={stockData.change >= 0 ? '#28a74555' : '#dc354555'}
                      style={{ fill: stockData.change >= 0 ? '#28a74533' : '#dc354533', strokeWidth: 1 }}
                    />
                  </Sparklines>
                </div>
              </div>
            ) : (
              <p className="text-muted mt-3">No chart data available.</p>
            )}

            <div className="mt-4">
              {!isAlreadyInWatchlist ? (
                <button className="btn btn-outline-success" onClick={handleAddToWatchlist}>
                  ➕ Add to Watchlist
                </button>
              ) : (
                <span className="badge bg-success fs-6">✔️ Already in Watchlist</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockSearch;
