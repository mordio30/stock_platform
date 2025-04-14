import React from 'react';
import StockSearch from '../components/StockSearch';

const Search = ({ token, watchlist, setWatchlist }) => {
  return (
    <div>
      <StockSearch token={token} watchlist={watchlist} setWatchlist={setWatchlist} />
    </div>
  );
};

export default Search;
