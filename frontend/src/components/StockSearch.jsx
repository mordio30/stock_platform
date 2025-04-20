import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Sparklines, SparklinesLine } from 'react-sparklines';
import { fetchIntradayStock } from '../utils/fetchStockData';

const StockSearch = ({ token, watchlist, setWatchlist }) => {
  const { symbol: routeSymbol } = useParams();
  const [inputSymbol, setInputSymbol] = useState('');
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [addMessage, setAddMessage] = useState('');
  const [trendData, setTrendData] = useState(null);

  useEffect(() => {
    if (routeSymbol) {
      const upper = routeSymbol.toUpperCase();
      setSymbol(upper);
      setInputSymbol(upper);
    }
  }, [routeSymbol]);

  useEffect(() => {
    if (symbol) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSymbol(inputSymbol.toUpperCase().trim());
  };

  const handleSearch = async () => {
    if (!symbol.trim()) {
      setError('Please enter a stock symbol.');
      setStockData(null);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setAddMessage('');
      setStockData(null);
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

      <form onSubmit={handleSubmit} className="input-group mb-3">
        <input
          type="text"
          value={inputSymbol}
          onChange={(e) => setInputSymbol(e.target.value)}
          placeholder="Enter symbol (e.g., AAPL)"
          className="form-control"
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

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
                </ul>
              </div>
            </div>

            {trendData && (
              <div className="mt-4">
                <h5>Intraday Trend</h5>
                <Sparklines data={trendData}>
                  <SparklinesLine color="blue" />
                </Sparklines>
              </div>
            )}

            {!isAlreadyInWatchlist && (
              <button
                onClick={handleAddToWatchlist}
                className="btn btn-outline-success mt-3"
              >
                ➕ Add to Watchlist
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StockSearch;

