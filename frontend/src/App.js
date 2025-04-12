import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import ItemForm from './ItemForm';
import ItemList from './ItemList';
import StockSearch from './StockSearch';
import Watchlist from './Watchlist';
import LoginForm from './LoginForm';

function App() {
  const [items, setItems] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));

  // Apply token to all axios requests
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const fetchItems = () => {
    axios.get('/api/items/')
      .then(response => setItems(response.data))
      .catch(error => console.error('Error fetching items:', error));
  };

  const fetchWatchlist = () => {
    axios.get('/api/stocks/watchlist/')
      .then(response => setWatchlist(response.data))
      .catch(error => console.error('Error fetching watchlist:', error));
  };

  useEffect(() => {
    if (token) {
      fetchItems();
      fetchWatchlist();
    }
  }, [token]);

  const handleItemCreated = newItem => {
    setItems(prevItems => [...prevItems, newItem]);
  };

  const handleItemUpdated = updatedItem => {
    setItems(prevItems =>
      prevItems.map(item => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const handleItemDeleted = deletedItemId => {
    setItems(prevItems =>
      prevItems.filter(item => item.id !== deletedItemId)
    );
  };

  const handleLogin = (accessToken) => {
    setToken(accessToken); // updates state and triggers useEffect
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setToken(null);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">📈 StockCompanion</h1>

      {!token ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <>
          <button onClick={handleLogout} className="btn btn-outline-danger mb-3 float-end">
            Logout
          </button>

          <StockSearch token={token} setWatchlist={setWatchlist}/>
          <Watchlist watchlist={watchlist} setWatchlist={setWatchlist} token={token} />
          <ItemForm onItemCreated={handleItemCreated} />
          <ItemList 
            items={items} 
            onItemUpdated={handleItemUpdated} 
            onItemDeleted={handleItemDeleted} 
          />
        </>
      )}
    </div>
  );
}

export default App;
