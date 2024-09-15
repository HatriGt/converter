import React, { useState, useEffect } from 'react';
import './App.css';

const CURRENCIES = ['TRY', 'INR', 'EUR', 'AED'];

function App() {
  const [from, setFrom] = useState('TRY');
  const [to, setTo] = useState('EUR');
  const [amount, setAmount] = useState('');
  const [converted, setConverted] = useState('');
  const [exchangeRates, setExchangeRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch(
          'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json'
        );
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rates.');
        }
        const data = await response.json();
        const filteredRates = {
          EUR: 1,
          TRY: data.eur.try,
          INR: data.eur.inr,
          AED: data.eur.aed
        };
        setExchangeRates(filteredRates);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

  const convert = (value, from, to) => {
    if (!value || !exchangeRates[from] || !exchangeRates[to]) return '';
    const eurValue = value / exchangeRates[from];
    return (eurValue * exchangeRates[to]).toFixed(2);
  };

  const handleFromAmountChange = (value) => {
    setAmount(value);
    setConverted(convert(value, from, to));
  };

  const handleToAmountChange = (value) => {
    setConverted(value);
    setAmount(convert(value, to, from));
  };

  const handleFromCurrencyChange = (currency) => {
    setFrom(currency);
    setConverted(convert(amount, currency, to));
  };

  const handleToCurrencyChange = (currency) => {
    setTo(currency);
    setConverted(convert(amount, from, currency));
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    setAmount(converted);
    setConverted(amount);
  };

  if (loading) {
    return <div className="converter">Loading exchange rates...</div>;
  }

  if (error) {
    return <div className="converter">Error: {error}</div>;
  }

  return (
    <div className="converter">
      <h2>Currency Converter</h2>
      <div className="currency-input">
        <input
          type="number"
          value={amount}
          placeholder="Amount"
          onChange={(e) => handleFromAmountChange(e.target.value)}
        />
        <select
          value={from}
          onChange={(e) => handleFromCurrencyChange(e.target.value)}
        >
          {CURRENCIES.map((curr) => (
            <option key={curr} value={curr}>
              {curr}
            </option>
          ))}
        </select>
      </div>
      <button className="swap-button" onClick={handleSwap}>
        Swap Currencies
      </button>
      <div className="currency-input">
        <input
          type="number"
          value={converted}
          placeholder="Converted"
          onChange={(e) => handleToAmountChange(e.target.value)}
        />
        <select
          value={to}
          onChange={(e) => handleToCurrencyChange(e.target.value)}
        >
          {CURRENCIES.map((curr) => (
            <option key={curr} value={curr}>
              {curr}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default App;
