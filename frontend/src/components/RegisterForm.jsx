import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterForm = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/users/register/', formData, {
        headers: { 'Content-Type': 'application/json' }
      });

      setSuccessMsg(response.data.message);
      setError('');
      setFormData({ username: '', email: '', password: '' });

      // Optional: redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Registration error:', err.response || err);
      setSuccessMsg('');
      if (err.response && err.response.data) {
        const messages = Object.values(err.response.data).flat().join(' ');
        setError(messages || 'Registration failed.');
      } else {
        setError('Registration failed.');
      }
    }
  };

  return (
    <div className="mb-4">
      <h2>Register</h2>
      {successMsg && <p className="text-success">{successMsg}</p>}
      {error && <p className="text-danger">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
          className="form-control mb-2"
          required
        />
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="form-control mb-2"
          required
        />
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="form-control mb-2"
          required
        />
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
    </div>
  );
};

export default RegisterForm;
