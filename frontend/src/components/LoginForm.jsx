import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/token/', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const token = response.data.access;
      const decoded = jwtDecode(token);
      const username = decoded.username;

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('username', username);

      setError('');
      onLogin(token); // App will also update username
      navigate('/');
    } catch (err) {
      console.error('Login error:', err.response || err);
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="mb-4">
      <h2>Login</h2>
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
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="form-control mb-2"
          required
        />
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  );
};

export default LoginForm;

