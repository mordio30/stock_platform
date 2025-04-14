import React from 'react';
import FinancialNews from '../components/FinancialNews';

const Home = () => {
  return (
    <div className="container mt-4">
      <h1>Welcome to StockCompanion</h1>
      <p>Track, trade, and learn about stocks.</p>
      <FinancialNews />
    </div>
  );
};

export default Home;

