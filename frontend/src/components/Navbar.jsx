import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import axios from 'axios';

const AppNavbar = ({ token, username, handleLogout }) => {
  const navigate = useNavigate();

  const onLogoutClick = () => {
    handleLogout();
    navigate('/');
  };

  const handleUnsubscribe = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) return;

    try {
      await axios.delete('/api/users/delete/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      handleLogout(); // Log user out
      alert('Your account has been deleted.');
      navigate('/');
    } catch (err) {
      console.error('Unsubscribe failed:', err);
      alert('Something went wrong while trying to delete your account.');
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">StockCompanion</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar" />
        <Navbar.Collapse id="navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/search">Search</Nav.Link>
            <Nav.Link as={Link} to="/watchlist">Watchlist</Nav.Link>
            <Nav.Link as={Link} to="/portfolio">Portfolio</Nav.Link>
            <Nav.Link as={Link} to="/risk">Risk Calculator</Nav.Link>
          </Nav>
          <Nav>
            {token ? (
              <>
                <Navbar.Text className="me-3">Welcome, {username}!</Navbar.Text>
                <Button variant="outline-light" onClick={onLogoutClick}>Logout</Button>
                <Button
                  variant="outline-danger"
                  onClick={handleUnsubscribe}
                  className="ms-2"
                >
                  Unsubscribe
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;

