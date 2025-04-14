import React from 'react';
import BuyStockForm from '../components/BuyStockForm';
import PortfolioList from '../components/PortfolioList';
import PortfolioChart from '../components/PortfolioChart';

const Portfolio = () => {
  return (
    <div className="container mt-4">
      <h2>💼 Portfolio Manager</h2>
      <BuyStockForm />
      <PortfolioChart />
      <PortfolioList />
    </div>
  );
};

export default Portfolio;

