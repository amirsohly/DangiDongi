import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiUsers, FiTag, FiSun, FiMoon, FiLoader, FiArrowUpRight, FiArrowLeft } from 'react-icons/fi';
import { FaCalculator } from 'react-icons/fa';
import './App.css';

// ===================================================================================
// Author: Amirreza - https://github.com/amirsohly/
// ===================================================================================
const calculateDebts = (totalPeople, expenses) => {
  const totalCost = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const sharePerPerson = totalPeople > 0 ? totalCost / totalPeople : 0;

  const balances = {};
  
  expenses.forEach(exp => {
    if (exp.name) {
      if (!balances[exp.name]) {
        balances[exp.name] = 0;
      }
      balances[exp.name] += Number(exp.amount || 0);
    }
  });

  Object.keys(balances).forEach(name => {
    balances[name] -= sharePerPerson;
  });

  const paidPeopleCount = Object.keys(balances).length;
  const unpaidPeopleCount = totalPeople - paidPeopleCount;
  if (unpaidPeopleCount > 0) {
    const unpaidName = `${unpaidPeopleCount} نفر دیگر`;
    balances[unpaidName] = -sharePerPerson;
  }
  
  const creditors = Object.entries(balances).filter(([name, amount]) => amount > 0);
  const debtors = Object.entries(balances).filter(([name, amount]) => amount < 0);
  
  if (creditors.length === 0 || debtors.length === 0) {
    return { totalCost, sharePerPerson, results: [] };
  }

  creditors.sort((a, b) => b[1] - a[1]);
  
  const [mainCreditorName] = creditors[0];
  const transactions = [];

  debtors.forEach(([debtorName, debtorAmount]) => {
    transactions.push({
      from: debtorName.includes("نفر دیگر") ? `${debtorName} (هر کدام)` : debtorName,
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
  const [currency, setCurrency] = useState('تومان'); 
  const [expenses, setExpenses] = useState([
    { name: '', amount: '' },
    { name: '', amount: '' },
  ]);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  const handleAddExpense = () => setExpenses([...expenses, { name: '', amount: '' }]);
  const handleRemoveExpense = (index) => setExpenses(expenses.filter((_, i) => i !== index));
  const handleExpenseChange = (index, field, value) => {
    const newExpenses = [...expenses];
    if (field === 'amount') {
      newExpenses[index][field] = value.replace(/[^0-9.]/g, '');
    } else {
      newExpenses[index][field] = value;
    }
    setExpenses(newExpenses);
  };

  // ===================================================================================
  // Author: Amirreza - https://github.com/amirsohly/
  // ===================================================================================
  const handleCalculate = () => {
    setError('');
    setResults(null);
    if (expenses.length === 0) {
      setError('لطفاً حداقل یک هزینه را اضافه کنید.');
      return;
    }
    const isAnyFieldEmpty = expenses.some(exp => exp.name.trim() === '' || exp.amount.toString().trim() === '');
    if (isAnyFieldEmpty) {
      setError('لطفاً نام و مبلغ تمام ردیف‌ها را پر کنید.');
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      const validExpenses = expenses.filter(exp => exp.name.trim() !== '' && exp.amount !== '' && !isNaN(parseFloat(exp.amount)));
      const calculatedResults = calculateDebts(totalPeople, validExpenses);
      setResults(calculatedResults);
      setIsLoading(false);
    }, 600);
  };
  
  const formatNumber = (num, currency) => {
    const number = Number(num);
    if (isNaN(number)) return '';
    const options = { minimumFractionDigits: 0, maximumFractionDigits: 2 };
    if (currency === 'تومان') {
      options.maximumFractionDigits = 0;
    } else {
      options.minimumFractionDigits = 2;
      options.maximumFractionDigits = 2;
    }
    return new Intl.NumberFormat('en-US', options).format(number);
  };
  
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };
  
  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: i => ({ opacity: 1, x: 0, transition: { delay: i * 0.1 } }),
  };

  return (
    <div className="App">
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleTheme} className="theme-toggle-btn">
        <AnimatePresence mode="wait">
          <motion.div key={theme} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      <motion.div 
        className="author-box"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <a 
          href="https://github.com/amirsohly"
          target="_blank" 
          rel="noopener noreferrer" 
          className="author-btn"
        >
          <FiArrowUpRight />
          درباره من و نمونه‌کار -
          Developer: Amirreza
        </a>
      </motion.div>

      <header className="App-header">
        <h1><span>دَنگی</span> دونگی</h1>
        
        <motion.div className="card" variants={cardVariants} initial="hidden" animate="visible">
          <div className="form-row">
            <div className="form-group"><label>تعداد کل افراد 👥</label><input type="number" value={totalPeople} onChange={(e) => setTotalPeople(e.target.value)} min="1"/></div>
            <div className="form-group"><label>واحد پول 💰</label><select value={currency} onChange={(e) => setCurrency(e.target.value)}><option value="تومان">تومان</option><option value="یورو">یورو (€)</option><option value="دلار">دلار ($)</option><option value="لیر">لیر (₺)</option></select></div>
          </div>
          <h3>💸 هزینه‌ها:</h3>
          <div style={{ maxHeight: '250px', overflowY: 'auto', padding: '0 5px' }}>
            <AnimatePresence>
              {expenses.map((expense, index) => (
                <motion.div key={index} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -50 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="input-with-icon expense-item">
                  <span className="icon"><FiUsers /></span>
                  <input type="text" placeholder="نام خریدار" value={expense.name} onChange={(e) => handleExpenseChange(index, 'name', e.target.value)}/>
                  <span className="icon"><FiTag /></span>
                  <input type="text" inputMode="decimal" placeholder="مبلغ" value={expense.amount ? new Intl.NumberFormat('en-US').format(expense.amount) : ''} onChange={(e) => handleExpenseChange(index, 'amount', e.target.value)}/>
                  <motion.button whileTap={{ scale: 0.8 }} className="remove-btn" onClick={() => handleRemoveExpense(index)}><FiTrash2 /></motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="button-group">
            <button className="add-btn" onClick={handleAddExpense}><FiPlus /> افزودن خریدار</button>
            <button onClick={handleCalculate} className="calculate-btn" disabled={isLoading}>
              {isLoading ? <FiLoader className="spinner" /> : <><FaCalculator /> محاسبه کن</>}
            </button>
          </div>
        </motion.div>

        <AnimatePresence>{error && (<motion.div className="error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>{error}</motion.div>)}</AnimatePresence>
        <AnimatePresence>
          {results && (
            <motion.div className="card results" variants={cardVariants} initial="hidden" animate="visible" exit="hidden">
              <h2>📊 خلاصه نتایج</h2>
              <p><strong>هزینه کل:</strong> {formatNumber(results.totalCost, currency)} {currency}</p>
              <p><strong>سهم هر نفر:</strong> {formatNumber(results.sharePerPerson, currency)} {currency}</p>
              <h3 className="transactions-title">لیست پرداخت‌ها:</h3>
              <ul>
                {results.results.map((transaction, index) => (
                  <motion.li key={index} custom={index} variants={listItemVariants} initial="hidden" animate="visible" className="transaction-item">
                    <span className={`pays-money ${transaction.from.includes('(هر کدام)') ? 'unpaid-group-text' : ''}`}>
                      {transaction.from}
                    </span>
                    <span className="arrow"><FiArrowLeft /><span className="amount">{formatNumber(transaction.amount, currency)} {currency}</span></span>
                    <span className="gets-money">{transaction.to}</span>
                  </motion.li>
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
