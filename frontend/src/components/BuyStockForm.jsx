import React, { useState } from 'react';
import axios from 'axios';

const BuyStockForm = () => {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        'http://localhost:8000/api/trades/',
        { symbol, quantity, purchase_price: purchasePrice },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage('Trade saved!');
      setSymbol('');
      setQuantity('');
      setPurchasePrice('');
    } catch (error) {
      console.error('Error buying stock:', error);
      setMessage('Failed to save trade');
    }
  };

  return (
    <div className="mb-4">
      <h4>🛒 Simulate a Stock Purchase</h4>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Symbol</label>
          <input
            type="text"
            className="form-control"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            required
          />
        </div>
        <div className="form-group">
          <label>Quantity</label>
          <input
            type="number"
            className="form-control"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Purchase Price</label>
          <input
            type="number"
            step="0.01"
            className="form-control"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
          />
        </div>
        <button className="btn btn-primary mt-2" type="submit">
          Buy
        </button>
      </form>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
};

export default BuyStockForm;
