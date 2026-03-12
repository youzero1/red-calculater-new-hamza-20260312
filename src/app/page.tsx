'use client';

import { useState, useEffect, useCallback } from 'react';

interface HistoryItem {
  id: number;
  expression: string;
  result: string;
  createdAt: string;
}

export default function CalculatorPage() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch {
      // silently fail
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const saveHistory = async (expr: string, result: string) => {
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression: expr, result }),
      });
      fetchHistory();
    } catch {
      // silently fail
    }
  };

  const clearHistory = async () => {
    try {
      await fetch('/api/history', { method: 'DELETE' });
      setHistory([]);
    } catch {
      // silently fail
    }
  };

  const inputDigit = (digit: string) => {
    if (display === 'Error') {
      setDisplay(digit);
      setExpression(digit);
      setWaitingForOperand(false);
      return;
    }
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (display === 'Error') {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperator = (nextOperator: string) => {
    if (display === 'Error') return;
    const current = parseFloat(display);

    if (prevValue !== null && operator && !waitingForOperand) {
      const result = calculate(parseFloat(prevValue), current, operator);
      const resultStr = formatResult(result);
      setDisplay(resultStr);
      setPrevValue(resultStr);
      setExpression(resultStr + ' ' + nextOperator);
    } else {
      setPrevValue(display);
      setExpression(display + ' ' + nextOperator);
    }

    setOperator(nextOperator);
    setWaitingForOperand(true);
  };

  const calculate = (a: number, b: number, op: string): number | 'Error' => {
    switch (op) {
      case '+':
        return a + b;
      case '−':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        if (b === 0) return 'Error';
        return a / b;
      default:
        return b;
    }
  };

  const formatResult = (result: number | 'Error'): string => {
    if (result === 'Error') return 'Error';
    if (!isFinite(result)) return 'Error';
    const str = result.toString();
    if (str.includes('e')) return result.toExponential(4);
    if (str.includes('.')) {
      const parts = str.split('.');
      if (parts[1].length > 10) {
        return parseFloat(result.toFixed(10)).toString();
      }
    }
    return str;
  };

  const handleEquals = () => {
    if (display === 'Error') return;
    if (prevValue === null || operator === null) return;

    const current = parseFloat(display);
    const prev = parseFloat(prevValue);
    const result = calculate(prev, current, operator);
    const resultStr = formatResult(result);
    const fullExpression = `${prevValue} ${operator} ${display}`;

    setExpression(fullExpression + ' =');
    setDisplay(resultStr);
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(true);

    if (resultStr !== 'Error') {
      saveHistory(fullExpression, resultStr);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const handleDelete = () => {
    if (display === 'Error') {
      handleClear();
      return;
    }
    if (waitingForOperand) return;
    if (display.length === 1) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const handleHistoryItemClick = (item: HistoryItem) => {
    setDisplay(item.result);
    setExpression(item.expression + ' =');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  return (
    <div className="page-wrapper">
      <div className="calculator-container">
        <div className="calculator-title">Calculator</div>
        <div className="display">
          <div className="display-expression">{expression || '\u00A0'}</div>
          <div className={`display-value${display === 'Error' ? ' error' : ''}`}>
            {display}
          </div>
        </div>

        <div className="buttons-grid">
          {/* Row 1 */}
          <button className="btn btn-clear" onClick={handleClear}>C</button>
          <button className="btn btn-delete" onClick={handleDelete}>⌫</button>
          <button className="btn btn-operator" onClick={() => handleOperator('%')}>%</button>
          <button className="btn btn-operator" onClick={() => handleOperator('÷')}>÷</button>

          {/* Row 2 */}
          <button className="btn btn-number" onClick={() => inputDigit('7')}>7</button>
          <button className="btn btn-number" onClick={() => inputDigit('8')}>8</button>
          <button className="btn btn-number" onClick={() => inputDigit('9')}>9</button>
          <button className="btn btn-operator" onClick={() => handleOperator('×')}>×</button>

          {/* Row 3 */}
          <button className="btn btn-number" onClick={() => inputDigit('4')}>4</button>
          <button className="btn btn-number" onClick={() => inputDigit('5')}>5</button>
          <button className="btn btn-number" onClick={() => inputDigit('6')}>6</button>
          <button className="btn btn-operator" onClick={() => handleOperator('−')}>−</button>

          {/* Row 4 */}
          <button className="btn btn-number" onClick={() => inputDigit('1')}>1</button>
          <button className="btn btn-number" onClick={() => inputDigit('2')}>2</button>
          <button className="btn btn-number" onClick={() => inputDigit('3')}>3</button>
          <button className="btn btn-operator" onClick={() => handleOperator('+')}>+</button>

          {/* Row 5 */}
          <button className="btn btn-number btn-zero" onClick={() => inputDigit('0')}>0</button>
          <button className="btn btn-number" onClick={inputDecimal}>.</button>
          <button className="btn btn-equals" onClick={handleEquals}>=</button>
        </div>
      </div>

      <div className="history-container">
        <div className="history-title">
          <span>History</span>
          {history.length > 0 && (
            <button className="history-clear-btn" onClick={clearHistory}>CLEAR</button>
          )}
        </div>
        {historyLoading ? (
          <div className="history-loading">Loading...</div>
        ) : history.length === 0 ? (
          <div className="history-empty">No calculations yet</div>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <div
                key={item.id}
                className="history-item"
                onClick={() => handleHistoryItemClick(item)}
              >
                <span className="history-expression">{item.expression}</span>
                <span className="history-result">= {item.result}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
