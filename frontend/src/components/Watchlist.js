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

            const timeSeries = res.data['Time Series (60min)'];
            if (!timeSeries) throw new Error(`No data for ${stock.symbol}`);

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
    <div>
      <h2>Watchlist</h2>
      {loading ? (
        <Spinner animation="border" />
      ) : (
        watchlist.map((item) => (
          <Card key={item.id}>
            <Card.Body>
            <Card.Title>
              <Link to={`/stocks/${item.symbol}`}>{item.symbol}</Link>
            </Card.Title>
              <Card.Text>
                {stockData[item.symbol]?.latestPrice ? (
                  <span>
                    Latest Price: {stockData[item.symbol].latestPrice}
                  </span>
                ) : (
                  'Loading...'
                )}
              </Card.Text>
              {stockData[item.symbol]?.chartData && (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stockData[item.symbol].chartData}>
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="price" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              )}
              <Button variant="danger" onClick={() => handleDelete(item.id)}>
                Remove
              </Button>
            </Card.Body>
          </Card>
        ))
      )}
    </div>
  );
};

export default Watchlist;
