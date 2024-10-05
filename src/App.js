import React, { useState, useEffect } from 'react';
import './App.css';
import { ReactComponent as SwapIcon } from './swap-icon.svg';

const CURRENCIES = ['USD', 'TRY', 'INR', 'EUR', 'AED'];

// Fallback exchange rates (updated as of the latest information)
const FALLBACK_RATES = {
  EUR: 1,
  TRY: 37.67,  // 1 EUR = 37.66 TRY
  INR: 92.27,  // 1 EUR = 93.04 INR
  AED: 4.03,    // 1 EUR = 4.03 AED
  USD: 1.10     // 1 EUR = 1.10 USD
};

function App() {
  const [from, setFrom] = useState('AED');  // Changed from 'USD' to 'AED'
  const [to, setTo] = useState('INR');      // Changed from 'EUR' to 'INR'
  const [amount, setAmount] = useState('');
  const [converted, setConverted] = useState('');
  const [exchangeRates, setExchangeRates] = useState(FALLBACK_RATES);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

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
          AED: data.eur.aed,
          USD: data.eur.usd
        };
        setExchangeRates(filteredRates);
        localStorage.setItem('exchangeRates', JSON.stringify(filteredRates));
        localStorage.setItem('lastFetchTime', Date.now().toString());
        setLoading(false);
        setIsOffline(false);
      } catch (err) {
        console.error('Error fetching rates:', err);
        handleOfflineRates();
      }
    };

    const handleOfflineRates = () => {
      const storedRates = localStorage.getItem('exchangeRates');
      const lastFetchTime = localStorage.getItem('lastFetchTime');
      
      if (storedRates && lastFetchTime) {
        const rates = JSON.parse(storedRates);
        const fetchTime = parseInt(lastFetchTime);
        const currentTime = Date.now();
        const hoursSinceLastFetch = (currentTime - fetchTime) / (1000 * 60 * 60);
        
        if (hoursSinceLastFetch < 24) {
          setExchangeRates(rates);
          setIsOffline(true);
          setLoading(false);
          return;
        }
      }
      
      setExchangeRates(FALLBACK_RATES);
      setIsOffline(true);
      setLoading(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      fetchExchangeRates();
    };

    const handleOffline = () => {
      setIsOffline(true);
      handleOfflineRates();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.onLine) {
      fetchExchangeRates();
    } else {
      handleOfflineRates();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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

  return (
    <div className="converter">
      <h2>Converter</h2>
      {isOffline && (
        <div className="offline-notice">
          Offline. Using {localStorage.getItem('exchangeRates') ? 'stored' : 'fallback'} rates.
        </div>
      )}
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
        <SwapIcon className="swap-icon" />
        Swap
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
