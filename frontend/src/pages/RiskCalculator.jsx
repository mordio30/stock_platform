import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import RiskCalculationList from '../components/RiskCalculationList';

const RiskCalculator = () => {
  const [symbol, setSymbol] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [results, setResults] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const buy = parseFloat(buyPrice);
    const stop = parseFloat(stopLoss);
    const target = parseFloat(targetPrice);

    if (isNaN(buy) || isNaN(stop) || isNaN(target)) {
      alert('Please enter valid numbers.');
      return;
    }

    const risk = buy - stop;
    const reward = target - buy;
    const ratio = reward / risk;

    setResults({ risk, reward, ratio });
    setMessage('');
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('🔒 Please log in to save your calculation.');
      return;
    }

    const buy = parseFloat(buyPrice);
    const stop = parseFloat(stopLoss);
    const target = parseFloat(targetPrice);
    const risk = buy - stop;
    const reward = target - buy;
    const ratio = reward / risk;

    try {
      await axios.post(
        'http://localhost:8000/api/stocks/risk/',
        {
          symbol: symbol,
          buy_price: buyPrice,
          stop_loss: stopLoss,
          target_price: targetPrice,
          risk_per_share: risk.toFixed(2),
          reward_per_share: reward.toFixed(2),
          risk_reward_ratio: ratio.toFixed(2),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage('✅ Calculation saved successfully!');
    } catch (error) {
      console.error('Save failed:', error.response?.data || error.message);
      setMessage('❌ Failed to save. Check your login or try again.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>🧮 Risk Calculator</h2>
      <Card className="p-4 shadow-sm">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Stock Symbol</Form.Label>
            <Form.Control
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Buy Price</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Stop Loss Price</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Profit Target Price</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Calculate
          </Button>
        </Form>

        {results && (
          <div className="mt-4">
            <h5>📊 Results:</h5>
            <ul>
              <li>Risk per Share: ${results.risk.toFixed(2)}</li>
              <li>Reward per Share: ${results.reward.toFixed(2)}</li>
              <li>Risk-Reward Ratio: {results.ratio.toFixed(2)} : 1</li>
            </ul>
            <Button variant="success" onClick={handleSave}>
              💾 Save Calculation
            </Button>
          </div>
        )}

        {message && (
          <Alert variant={message.startsWith('✅') ? 'success' : 'warning'} className="mt-3">
            {message}
          </Alert>
        )}
      </Card>

      <div className="mt-5">
        <RiskCalculationList />
      </div>
    </div>
  );
};

export default RiskCalculator;
