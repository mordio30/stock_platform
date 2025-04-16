// src/utils/fetchStockData.js
const API_KEY = 'ALPHA_VANTAGE_KEY';

export const fetchIntradayStock = async (symbol) => {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&outputsize=compact&apikey=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const timeSeries = data['Time Series (5min)'];
    if (!timeSeries) throw new Error('Invalid response');

    const timestamps = Object.keys(timeSeries).sort(); // oldest to newest
    const trend = timestamps.slice(-5).map(t => +timeSeries[t]['4. close']);

    const latest = timeSeries[timestamps[timestamps.length - 1]];
    const latestPrice = +latest['4. close'];

    const previous = timeSeries[timestamps[timestamps.length - 2]];
    const previousPrice = +previous['4. close'];

    const change = +(((latestPrice - previousPrice) / previousPrice) * 100).toFixed(2);

    return {
      symbol,
      price: latestPrice,
      change,
      trend,
    };
  } catch (err) {
    console.error(`Error fetching data for ${symbol}:`, err);
    return null;
  }
};
