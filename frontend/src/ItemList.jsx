import React, { useState } from 'react';
import axios from 'axios';

const ItemList = ({ items, onItemUpdated, onItemDeleted }) => {
  const [editItemId, setEditItemId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    ticker: '',
    price: '',
    category: '',
    description: ''
  });

  const handleEditClick = (item) => {
    setEditItemId(item.id);
    setEditFormData(item);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    axios.put(`/api/items/${editItemId}/`, editFormData)
      .then(response => {
        onItemUpdated(response.data);
        setEditItemId(null);
      })
      .catch(error => console.error('Error updating item:', error));
  };

  const handleCancel = () => {
    setEditItemId(null);
  };

  const handleDelete = (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      axios.delete(`/api/items/${itemId}/`)
        .then(() => {
          onItemDeleted(itemId);
        })
        .catch(error => console.error('Error deleting item:', error));
    }
  };

  return (
    <div>
      <h2>Stock Items</h2>
      {Array.isArray(items) && items.length > 0 ? (
        <>
          <p>Total items: <strong>{items.length}</strong></p>
          <ul className="list-group">
            {items.map(item => (
              <li key={item.id} className="list-group-item">
                {editItemId === item.id ? (
                  <form onSubmit={handleEditSubmit}>
                    {['name', 'ticker', 'price', 'category', 'description'].map((field) => (
                      <input
                        key={field}
                        name={field}
                        value={editFormData[field]}
                        onChange={handleEditChange}
                        placeholder={field}
                        className="form-control mb-1"
                      />
                    ))}
                    <button type="submit" className="btn btn-success btn-sm me-2">Save</button>
                    <button type="button" onClick={handleCancel} className="btn btn-secondary btn-sm">Cancel</button>
                  </form>
                ) : (
                  <>
                    <strong>{item.name}</strong> ({item.ticker}) - ${item.price}
                    <br />
                    <em>{item.category}</em>: {item.description}
                    <br />
                    <button onClick={() => handleEditClick(item)} className="btn btn-warning btn-sm mt-2 me-2">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-sm mt-2">Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-muted">No stock items available.</p>
      )}
    </div>
  );
};

export default ItemList;
