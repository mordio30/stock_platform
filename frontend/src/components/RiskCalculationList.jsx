import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Table } from 'react-bootstrap';

const RiskCalculationList = ({ refresh }) => {
  const [calculations, setCalculations] = useState([]);

  useEffect(() => {
    const fetchRiskCalcs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/stocks/risk/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCalculations(response.data);
      } catch (error) {
        console.error('Error fetching risk calculations:', error);
      }
    };

    fetchRiskCalcs();
  }, [refresh]); // 👈 re-fetch on refresh change

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/stocks/risk/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCalculations(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting calculation:', error);
    }
  };

  return (
    <div className="mt-4">
      <h4>📊 Saved Risk Calculations</h4>
      {calculations.length === 0 ? (
        <p className="text-muted">No saved calculations yet.</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Buy</th>
              <th>Stop</th>
              <th>Target</th>
              <th>Risk/Reward</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {calculations.map(calc => (
              <tr key={calc.id}>
                <td>{calc.symbol}</td>
                <td>${calc.buy_price}</td>
                <td>${calc.stop_loss}</td>
                <td>${calc.target_price}</td>
                <td>{calc.risk_reward_ratio} : 1</td>
                <td>
                  {calc.date_created ? new Date(calc.date_created.replace(' ', 'T')).toLocaleDateString() : 'N/A'}
                </td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(calc.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default RiskCalculationList;
