import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  // Fetch the user's watchlist
  const fetchWatchlist = async () => {
    try {
      const response = await fetch('/api/stocks/watchlist/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setWatchlist(data);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, [token]);

  // Fetch stock price and chart data for each stock in the watchlist
  useEffect(() => {
    const fetchDataForStocks = async () => {
      if (watchlist.length === 0) return;
      setLoading(true);
      const data = {};

      await Promise.all(
        watchlist.map(async (stock) => {
          try {
            const res = await axios.get('https://www.alphavantage.co/query', {
              params: {
                function: 'TIME_SERIES_INTRADAY',
                symbol: stock.symbol,
                interval: '60min',
                apikey: 'demo', // Replace with real API key
              },
            });

            if (!res.data || !res.data['Time Series (60min)']) {
              throw new Error(`No time series data for ${stock.symbol}`);
            }
            
            const timeSeries = res.data['Time Series (60min)'];

            const chartData = Object.entries(timeSeries)
              .slice(0, 10)
              .reverse()
              .map(([time, dataPoint]) => ({
                time,
                price: parseFloat(dataPoint['4. close']),
              }));

            const latestPrice = chartData[chartData.length - 1].price;

            data[stock.symbol] = {
              chartData,
              latestPrice,
            };
          } catch (error) {
            console.error(`Error fetching data for ${stock.symbol}:`, error);
            data[stock.symbol] = { chartData: [], latestPrice: 'N/A' };
          }
        })
      );

      setStockData(data);
      setLoading(false);
    };

    fetchDataForStocks();
  }, [watchlist]);

  // Handle removal of a stock from the watchlist
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/stocks/watchlist/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchWatchlist(); // Refresh the watchlist
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="container">
      <h2 className="mb-4">Watchlist</h2>
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <div className="row">
          {watchlist.map((item) => (
            <div key={item.id} className="col-md-4 mb-4">
              <Card className="text-center shadow-sm watchlist-card h-100">
                <Card.Body>
                  <Card.Title className="mb-3">
                    <Link to={`/stocks/${item.symbol}`} className="text-decoration-none fw-bold">
                      {item.symbol}
                    </Link>
                  </Card.Title>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    Remove
                  </Button>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
