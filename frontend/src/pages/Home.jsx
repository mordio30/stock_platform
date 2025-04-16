import React from 'react';
import FinancialNews from '../components/FinancialNews';
import StockHighlights from '../components/StockHighlights';

const Home = () => {
  return (
    <div className="container mt-4">
      <h1>Welcome to StockCompanion</h1>
      <p>Track, trade, and learn about stocks.</p>

      <div className="row">
        <div className="col-lg-6">
          <StockHighlights />
        </div>
        <div className="col-lg-6">
          <FinancialNews />
        </div>
      </div>
    </div>
  );
};

export default Home;

