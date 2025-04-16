import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, Button, Spinner } from 'react-bootstrap';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  // Fetch watchlist from backend
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const response = await fetch('/api/stocks/watchlist/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setWatchlist(data);  // Ensure you're storing `id`, `symbol`, and `price` here
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      }
    };

    fetchWatchlist();
  }, [token]);

  // Fetch stock price and chart data
  useEffect(() => {
    const fetchDataForStocks = async () => {
      if (watchlist.length === 0) return;
      setLoading(true);
      const data = {};

      await Promise.all(
        watchlist.map(async (stock) => {
          try {
            const res = await axios.get(
              `https://www.alphavantage.co/query`,
              {
                params: {
                  function: 'TIME_SERIES_INTRADAY',
                  symbol: stock.symbol,
                  interval: '60min',
                  apikey: 'demo', // Replace with your real API key
                },
              }
            );

            const timeSeries = res.data['Time Series (60min)'];
            if (!timeSeries) throw new Error(`No data for ${stock.symbol}`);

            const chartData = Object.entries(timeSeries).slice(0, 10).reverse().map(([time, dataPoint]) => ({
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
            data[stock.symbol] = { chartData: [], latestPrice: 'N/A' }; // Fallback data
          }
        })
      );

      setStockData(data);
      setLoading(false);
    };

    fetchDataForStocks();
  }, [watchlist]);

  const removeFromWatchlist = async (symbol) => {
    try {
      await axios.delete(`/api/stocks/watchlist/${symbol}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchWatchlist();  // Refresh the watchlist after removal
    } catch (error) {
      console.error('Error removing stock:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Your Watchlist</h2>
      {loading && <Spinner animation="border" />}
      <div className="row">
        {watchlist.map((stock) => {
          const stockInfo = stockData[stock.symbol];
          return (
            <div className="col-md-4 mb-4" key={stock.symbol}>
              <Card>
                <Card.Body>
                  <Card.Title>{stock.symbol}</Card.Title>
                  {stockInfo ? (
                    <>
                      <Card.Text>Latest Price: ${stockInfo.latestPrice !== 'N/A' ? stockInfo.latestPrice.toFixed(2) : 'N/A'}</Card.Text>
                      {stockInfo.chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={150}>
                          <LineChart data={stockInfo.chartData}>
                            <XAxis dataKey="time" hide />
                            <YAxis domain={['auto', 'auto']} />
                            <Tooltip />
                            <Line type="monotone" dataKey="price" stroke="#007bff" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <p>No data available for the chart.</p>
                      )}
                    </>
                  ) : (
                    <p>Loading chart...</p>
                  )}
                  <Button
                    variant="danger"
                    className="mt-2"
                    onClick={() => removeFromWatchlist(stock.symbol)}
                  >
                    Remove
                  </Button>
                </Card.Body>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Watchlist;
