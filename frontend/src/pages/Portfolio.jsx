import React, { useState } from 'react';
import PortfolioList from '../components/PortfolioList';
import PortfolioChart from '../components/PortfolioChart';

const Portfolio = () => {
  const [refresh, setRefresh] = useState(false); // shared state

  return (
    <div className="container mt-4">
      <h2>💼 Portfolio Manager</h2>
      <PortfolioChart refresh={refresh} />
      <PortfolioList refresh={refresh} setRefresh={setRefresh} />
    </div>
  );
};

export default Portfolio;
