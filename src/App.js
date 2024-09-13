import React, { useState } from 'react';
import './App.css';

const exchangeRates = {
  TRY: { EUR: 0.054, INR: 4.5, AED: 0.22 },
  EUR: { TRY: 18.52, INR: 83.33, AED: 4.05 },
  INR: { TRY: 0.22, EUR: 0.012, AED: 0.048 },
  AED: { TRY: 4.54, EUR: 0.25, INR: 20.83 },
};

function App() {
  const [from, setFrom] = useState('TRY');
  const [to, setTo] = useState('EUR');
  const [amount, setAmount] = useState('');
  const [converted, setConverted] = useState('');
  const [isEditing, setIsEditing] = useState(false); // New state to track editing

  const handleConvert = (amt, fromCurr, toCurr, editing = false) => {
    if (!amt) {
      setConverted('');
      setIsEditing(false);
      return;
    }
    const rate = exchangeRates[fromCurr][toCurr];
    if (editing) {
      setAmount((amt / rate).toFixed(2));
    } else {
      setConverted((amt * rate).toFixed(2));
    }
  };

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
    handleConvert(amount, to, temp);
  };

  return (
    <div className="converter">
      <h2>Currency Converter</h2>
      <div className="currency-input">
        <input
          type="number"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            handleConvert(e.target.value, from, to);
            setIsEditing(false);
          }}
        />
        <select value={from} onChange={(e) => { setFrom(e.target.value); handleConvert(amount, e.target.value, to); }}>
          {Object.keys(exchangeRates).map((curr) => (
            <option key={curr} value={curr}>{curr}</option>
          ))}
        </select>
      </div>
      <button className="swap-button" onClick={handleSwap}>Swap</button>
      <div className="currency-input">
        <input
          type="number"
          value={converted}
          readOnly={!isEditing} // Make editable based on state
          onFocus={() => setIsEditing(true)}
          onChange={(e) => {
            setConverted(e.target.value);
            handleConvert(e.target.value, to, from, true);
          }}
        />
        <select value={to} onChange={(e) => { setTo(e.target.value); handleConvert(amount, from, e.target.value); }}>
          {Object.keys(exchangeRates).map((curr) => (
            <option key={curr} value={curr}>{curr}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default App;
