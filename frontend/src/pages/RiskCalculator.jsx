import React, { useState, useRef } from 'react';
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
  const [refresh, setRefresh] = useState(false); // 👈 added for triggering refresh

  const listRef = useRef(null); // 👈 ref for scrolling

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
      setRefresh(prev => !prev); // 🔁 trigger refresh in list
      setResults(null); // 💡 clear results box
      setSymbol(''); // 🧹 clear form
      setBuyPrice('');
      setStopLoss('');
      setTargetPrice('');

      // ⬇️ scroll to saved list
      setTimeout(() => {
        listRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
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
              <li><strong>Risk per Share:</strong> ${results.risk.toFixed(2)}</li>
              <li><strong>Reward per Share:</strong> ${results.reward.toFixed(2)}</li>
              <li>
                <strong>Risk-Reward Ratio:</strong> {results.ratio.toFixed(2)} : 1{' '}
                {results.ratio >= 2 ? (
                  <span className="text-success">(Excellent setup)</span>
                ) : results.ratio >= 1 ? (
                  <span className="text-warning">(Acceptable risk)</span>
                ) : (
                  <span className="text-danger">(Unfavorable trade)</span>
                )}
              </li>
            </ul>
            <p className="mt-2">
              {results.ratio >= 2
                ? '✅ Great setup! Your potential reward significantly outweighs your risk.'
                : results.ratio >= 1
                  ? '⚠️ Your reward is higher than your risk, but consider aiming for a 2:1 or better.'
                  : '❌ Your risk exceeds potential reward. Reconsider the setup or adjust your targets.'}
            </p>
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

      <div className="mt-5" ref={listRef}>
        <RiskCalculationList refresh={refresh} /> {/* 👈 now takes refresh */}
      </div>
    </div>
  );
};

export default RiskCalculator;
