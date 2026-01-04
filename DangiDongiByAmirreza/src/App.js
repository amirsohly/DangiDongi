import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiUsers, FiTag, FiSun, FiMoon, FiLoader, FiArrowRight } from 'react-icons/fi';
import { FaCalculator } from 'react-icons/fa';
import './App.css';

const calculateDebts = (totalPeople, expenses) => {
  const totalCost = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const sharePerPerson = totalPeople > 0 ? totalCost / totalPeople : 0;
  const balances = {};
  
  expenses.forEach(exp => {
    if (exp.name) {
      if (!balances[exp.name]) balances[exp.name] = 0;
      balances[exp.name] += Number(exp.amount || 0);
    }
  });

  Object.keys(balances).forEach(name => {
    balances[name] -= sharePerPerson;
  });

  const paidPeopleCount = Object.keys(balances).length;
  const unpaidPeopleCount = totalPeople - paidPeopleCount;
  if (unpaidPeopleCount > 0) {
    const unpaidName = `${unpaidPeopleCount} Other people`;
    balances[unpaidName] = -sharePerPerson;
  }
  
  const creditors = Object.entries(balances).filter(([_, amount]) => amount > 0);
  const debtors = Object.entries(balances).filter(([_, amount]) => amount < 0);
  
  if (creditors.length === 0 || debtors.length === 0) {
    return { totalCost, sharePerPerson, results: [] };
  }

  creditors.sort((a, b) => b[1] - a[1]);
  const [mainCreditorName] = creditors[0];
  const transactions = [];

  debtors.forEach(([debtorName, debtorAmount]) => {
    transactions.push({
      from: debtorName.includes("Other people") ? `${debtorName} (Each)` : debtorName,
      to: mainCreditorName,
      amount: -debtorAmount,
    });
  });

  creditors.slice(1).forEach(([otherCreditorName, otherCreditorAmount]) => {
    transactions.push({
      from: mainCreditorName,
      to: otherCreditorName,
      amount: otherCreditorAmount,
    });
  });

  return { totalCost, sharePerPerson, results: transactions };
};

function App() {
  const [totalPeople, setTotalPeople] = useState(6);
  const [currency, setCurrency] = useState('Euro'); 
  const [expenses, setExpenses] = useState([{ name: '', amount: '' }, { name: '', amount: '' }]);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  const handleAddExpense = () => setExpenses([...expenses, { name: '', amount: '' }]);
  const handleRemoveExpense = (index) => setExpenses(expenses.filter((_, i) => i !== index));
  
  const handleExpenseChange = (index, field, value) => {
    const newExpenses = [...expenses];
    if (field === 'amount') {
      if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
        newExpenses[index][field] = value;
      }
    } else {
      newExpenses[index][field] = value;
    }
    setExpenses(newExpenses);
  };

  const handleCalculate = () => {
    setError('');
    if (expenses.some(exp => exp.name.trim() === '' || exp.amount === '')) {
      setError('Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setResults(calculateDebts(totalPeople, expenses));
      setIsLoading(false);
    }, 600);
  };

  const formatNumber = (num) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);

  return (
    <div className="App">
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleTheme} className="theme-toggle-btn">
        {theme === 'light' ? <FiMoon /> : <FiSun />}
      </motion.button>

      <header className="App-header">
        <h1><span>Dangi</span> Dongi</h1>
        
        <div className="card">
          <div className="form-row">
            <div className="form-group">
                <label>Total People 👥</label>
                <input type="number" value={totalPeople} onChange={(e) => setTotalPeople(e.target.value)} min="1"/>
            </div>
            <div className="form-group">
                <label>Currency 💰</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="Toman">Toman</option>
                    <option value="Euro">Euro (€)</option>
                    <option value="Dollar">Dollar ($)</option>
                    <option value="Lira">Lira (₺)</option>
                </select>
            </div>
          </div>
          <h3>💸 Expenses:</h3>
          <div className="expense-list">
            <AnimatePresence>
              {expenses.map((expense, index) => (
                <motion.div key={index} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -50 }} className="expense-item">
                  <div className="input-with-icon" style={{flex: 2}}>
                    <span className="icon"><FiUsers /></span>
                    <input type="text" placeholder="Payer Name" value={expense.name} onChange={(e) => handleExpenseChange(index, 'name', e.target.value)}/>
                  </div>
                  <div className="input-with-icon" style={{flex: 1.5}}>
                    <span className="icon"><FiTag /></span>
                    <input type="text" inputMode="decimal" placeholder="Amount" value={expense.amount} onChange={(e) => handleExpenseChange(index, 'amount', e.target.value)}/>
                  </div>
                  <button className="remove-btn" onClick={() => handleRemoveExpense(index)}><FiTrash2 /></button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="button-group">
            <button className="add-btn" onClick={handleAddExpense}><FiPlus /> Add Payer</button>
            <button onClick={handleCalculate} className="calculate-btn" disabled={isLoading}>
              {isLoading ? <FiLoader className="spinner" /> : <><FaCalculator /> Calculate</>}
            </button>
          </div>
          <AnimatePresence>
            {error && (
              <motion.div className="error-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {results && (
            <motion.div className="card results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2>📊 Results Summary</h2>
              <div className="summary-details">
                <p><strong>Total Cost:</strong> <span>{formatNumber(results.totalCost)} {currency}</span></p>
                <p><strong>Share Per Person:</strong> <span>{formatNumber(results.sharePerPerson)} {currency}</span></p>
              </div>
              <h3 className="transactions-title">Payment Transactions:</h3>
              <ul>
                {results.results.map((t, i) => (
                  <li key={i} className="transaction-item">
                    <span className={t.from.includes('(Each)') ? 'unpaid-group-text' : 'payer-name'}>{t.from}</span>
                    <div className="arrow">
                      <FiArrowRight />
                      <span className="amount">{formatNumber(t.amount)} {currency}</span>
                    </div>
                    <span className="gets-money">{t.to}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  );
}

export default App;
