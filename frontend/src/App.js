import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import Watchlist from './components/Watchlist';
import Portfolio from './pages/Portfolio';
import LoginForm from './components/LoginForm';
import RiskCalculator from './pages/RiskCalculator';
import jwtDecode from 'jwt-decode';
import axios from 'axios';
import Register from './pages/Register';
import StockSearch from './components/StockSearch';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || null);
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    if (token && !username) {
      const fetchUserInfo = async () => {
        try {
          const res = await axios.get('/api/user/', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setUsername(res.data.username);
          localStorage.setItem('username', res.data.username);
        } catch (err) {
          console.error('Failed to fetch user info:', err);
          setUsername(null);
        }
      };

      fetchUserInfo();
    }
  }, [token, username]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
  };

  const handleLogin = (token) => {
    setToken(token);
    localStorage.setItem('token', token);
    // Username will be fetched by useEffect after setting token
  };

  return (
    <Router>
      <Navbar token={token} username={username} handleLogout={handleLogout} />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search token={token} watchlist={watchlist} setWatchlist={setWatchlist} />} />
          <Route path="/watchlist" element={<Watchlist token={token} watchlist={watchlist} setWatchlist={setWatchlist} />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/risk" element={<RiskCalculator />} />

          <Route
            path="/stocks/:symbol"
            element={<StockSearch token={token} watchlist={watchlist} setWatchlist={setWatchlist} />}
          />


        </Routes>
      </div>
    </Router>
  );
}

export default App;
