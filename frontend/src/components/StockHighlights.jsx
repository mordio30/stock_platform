import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Sparklines, SparklinesLine } from 'react-sparklines';
import { FaChartLine } from 'react-icons/fa';
import { fetchIntradayStock } from '../utils/fetchStockData';

const stockSymbols = ['AAPL', 'GOOGL', 'TSLA', 'AMZN', 'MSFT'];

const StockHighlights = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  const updatePrices = async () => {
    setLoading(true);
    const fetched = await Promise.all(stockSymbols.map(symbol => fetchIntradayStock(symbol)));
    const validStocks = fetched.filter(Boolean);
    setStocks(validStocks);
    sessionStorage.setItem('stockHighlights', JSON.stringify(validStocks));
    setLoading(false);
  };

  useEffect(() => {
    const cached = sessionStorage.getItem('stockHighlights');
    if (cached) {
      setStocks(JSON.parse(cached));
    } else {
      updatePrices();
    }
  }, []);

  return (
    <div>
      <h2 className="my-4"><FaChartLine className="me-2" />Stock Highlights</h2>
      <Button variant="outline-primary" className="mb-3" onClick={updatePrices} disabled={loading}>
        {loading ? 'Refreshing...' : 'Refresh Prices'}
      </Button>

      <Row xs={1} sm={2} md={2} lg={2} xl={2} className="g-4">
        {stocks.map(stock => (
          <Col key={stock.symbol}>
            <Card className="shadow-sm border highlight-card">
              <Card.Body>
                <Card.Title className="d-flex justify-content-between align-items-center">
                  <span>{stock.symbol}</span>
                  <span className={`fw-bold ${stock.change >= 0 ? 'text-success' : 'text-danger'}`}>
                    {stock.change}%
                  </span>
                </Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{stock.name}</Card.Subtitle>
                <Card.Text>
                  <strong>Price:</strong> ${stock.price.toFixed(2)}
                </Card.Text>
                <Sparklines data={stock.trend} width={100} height={30} margin={5}>
                  <SparklinesLine color={stock.change >= 0 ? "green" : "red"} style={{ fill: "none" }} />
                </Sparklines>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Custom CSS for card hover */}
      <style>{`
        .highlight-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s;
        }

        .highlight-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
        }
      `}</style>
    </div>
  );
};

export default StockHighlights;
