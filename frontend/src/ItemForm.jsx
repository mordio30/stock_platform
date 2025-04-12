import React, { useState } from 'react';
import axios from 'axios';

const ItemForm = ({ onItemCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    ticker: '',
    price: '',
    category: '',
    description: '',
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('/api/items/', formData)
      .then(response => {
        onItemCreated(response.data);
        setFormData({ name: '', ticker: '', price: '', category: '', description: '' });
      })
      .catch(error => {
        console.error('Error creating item:', error);
      });
  };

  return (
    <form className="mb-4" onSubmit={handleSubmit}>
      <h3>Add Stock Item</h3>
      {['name', 'ticker', 'price', 'category', 'description'].map((field) => (
        <div key={field} className="mb-2">
          <input
            type="text"
            name={field}
            value={formData[field]}
            onChange={handleChange}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            className="form-control"
          />
        </div>
      ))}
      <button type="submit" className="btn btn-primary">Add Stock</button>
    </form>
  );
};

export default ItemForm;
