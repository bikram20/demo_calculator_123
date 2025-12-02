'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface CalculationHistory {
  expression: string;
  result: string;
  timestamp: Date;
}

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [scientificMode, setScientificMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [currentExpression, setCurrentExpression] = useState('');

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('calculatorHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((h: any) => ({
          ...h,
          timestamp: new Date(h.timestamp)
        })));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('calculatorHistory', JSON.stringify(history));
    }
  }, [history]);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
      setCurrentExpression(num);
    } else {
      setDisplay(display === '0' ? num : display + num);
      setCurrentExpression(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
      setCurrentExpression('0.');
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
      setCurrentExpression(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
    setCurrentExpression('');
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('calculatorHistory');
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);
    let expression = currentExpression || display;

    if (previousValue === null) {
      setPreviousValue(inputValue);
      setCurrentExpression(`${display} ${nextOperation}`);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
      setCurrentExpression(`${currentValue} ${operation} ${inputValue} = ${newValue}`);
    } else {
      setCurrentExpression(`${expression} ${nextOperation}`);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return secondValue !== 0 ? firstValue / secondValue : 0;
      case '^':
        return Math.pow(firstValue, secondValue);
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      const expression = `${previousValue} ${operation} ${inputValue}`;
      
      // Add to history
      const historyEntry: CalculationHistory = {
        expression,
        result: String(newValue),
        timestamp: new Date()
      };
      setHistory(prev => [historyEntry, ...prev].slice(0, 20)); // Keep last 20
      
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
      setCurrentExpression('');
    }
  };

  const performScientificFunction = (func: string) => {
    try {
      const value = parseFloat(display);
      let result: number;
      let expression = '';

      switch (func) {
        case 'sin':
          result = Math.sin(value);
          expression = `sin(${value})`;
          break;
        case 'cos':
          result = Math.cos(value);
          expression = `cos(${value})`;
          break;
        case 'tan':
          result = Math.tan(value);
          expression = `tan(${value})`;
          break;
        case 'log':
          result = Math.log10(value);
          expression = `log(${value})`;
          break;
        case 'ln':
          result = Math.log(value);
          expression = `ln(${value})`;
          break;
        case 'sqrt':
          result = Math.sqrt(value);
          expression = `√(${value})`;
          break;
        default:
          result = value;
          expression = `${func}(${value})`;
      }

      // Add to history
      const historyEntry: CalculationHistory = {
        expression,
        result: String(result),
        timestamp: new Date()
      };
      setHistory(prev => [historyEntry, ...prev].slice(0, 20));

      setDisplay(String(result));
      setWaitingForNewValue(true);
      setCurrentExpression('');
    } catch (error) {
      setDisplay('Error');
      setWaitingForNewValue(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-blue-600">Scientific Calculator</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setScientificMode(!scientificMode)}
              className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-600"
            >
              {scientificMode ? 'Basic' : 'Scientific'}
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
            >
              {showHistory ? 'Hide' : 'Show'} History
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calculator */}
          <div>
            {/* Display */}
            <div className="mb-4 rounded-lg bg-gray-900 p-6 text-right">
              <div className="text-4xl font-mono font-semibold text-white overflow-x-auto">
                {display}
              </div>
            </div>

            {/* Scientific Functions Row (only when in scientific mode) */}
            {scientificMode && (
              <div className="mb-3 grid grid-cols-6 gap-2">
                <button
                  onClick={() => performScientificFunction('sin')}
                  className="rounded-lg bg-indigo-500 px-2 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 active:bg-indigo-700"
                >
                  sin
                </button>
                <button
                  onClick={() => performScientificFunction('cos')}
                  className="rounded-lg bg-indigo-500 px-2 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 active:bg-indigo-700"
                >
                  cos
                </button>
                <button
                  onClick={() => performScientificFunction('tan')}
                  className="rounded-lg bg-indigo-500 px-2 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 active:bg-indigo-700"
                >
                  tan
                </button>
                <button
                  onClick={() => performScientificFunction('log')}
                  className="rounded-lg bg-indigo-500 px-2 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 active:bg-indigo-700"
                >
                  log
                </button>
                <button
                  onClick={() => performScientificFunction('ln')}
                  className="rounded-lg bg-indigo-500 px-2 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 active:bg-indigo-700"
                >
                  ln
                </button>
                <button
                  onClick={() => performScientificFunction('sqrt')}
                  className="rounded-lg bg-indigo-500 px-2 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 active:bg-indigo-700"
                >
                  √
                </button>
              </div>
            )}

            {/* Buttons */}
            <div className="grid grid-cols-4 gap-3">
              {/* Row 1 */}
              <button
                onClick={clear}
                className="col-span-2 rounded-lg bg-red-500 px-4 py-4 text-xl font-semibold text-white transition-colors hover:bg-red-600 active:bg-red-700"
              >
                Clear
              </button>
              <button
                onClick={() => performOperation('÷')}
                className="rounded-lg bg-orange-500 px-4 py-4 text-xl font-semibold text-white transition-colors hover:bg-orange-600 active:bg-orange-700"
              >
                ÷
              </button>
              <button
                onClick={() => performOperation('×')}
                className="rounded-lg bg-orange-500 px-4 py-4 text-xl font-semibold text-white transition-colors hover:bg-orange-600 active:bg-orange-700"
              >
                ×
              </button>

              {/* Row 2 */}
              <button
                onClick={() => inputNumber('7')}
                className="rounded-lg bg-gray-200 px-4 py-4 text-xl font-semibold text-gray-800 transition-colors hover:bg-gray-300 active:bg-gray-400"
              >
                7
              </button>
              <button
                onClick={() => inputNumber('8')}
                className="rounded-lg bg-gray-200 px-4 py-4 text-xl font-semibold text-gray-800 transition-colors hover:bg-gray-300 active:bg-gray-400"
              >
                8
              </button>
              <button
                onClick={() => inputNumber('9')}
                className="rounded-lg bg-gray-200 px-4 py-4 text-xl font-semibold text-gray-800 transition-colors hover:bg-gray-300 active:bg-gray-400"
              >
                9
              </button>
              <button
                onClick={() => performOperation('-')}
                className="rounded-lg bg-orange-500 px-4 py-4 text-xl font-semibold text-white transition-colors hover:bg-orange-600 active:bg-orange-700"
              >
                −
              </button>

              {/* Row 3 */}
              <button
                onClick={() => inputNumber('4')}
                className="rounded-lg bg-gray-200 px-4 py-4 text-xl font-semibold text-gray-800 transition-colors hover:bg-gray-300 active:bg-gray-400"
              >
                4
              </button>
              <button
                onClick={() => inputNumber('5')}
                className="rounded-lg bg-gray-200 px-4 py-4 text-xl font-semibold text-gray-800 transition-colors hover:bg-gray-300 active:bg-gray-400"
              >
                5
              </button>
              <button
                onClick={() => inputNumber('6')}
                className="rounded-lg bg-gray-200 px-4 py-4 text-xl font-semibold text-gray-800 transition-colors hover:bg-gray-300 active:bg-gray-400"
              >
                6
              </button>
              <button
                onClick={() => performOperation('+')}
                className="rounded-lg bg-orange-500 px-4 py-4 text-xl font-semibold text-white transition-colors hover:bg-orange-600 active:bg-orange-700"
              >
                +
              </button>

              {/* Row 4 */}
              <button
                onClick={() => inputNumber('1')}
                className="rounded-lg bg-gray-200 px-4 py-4 text-xl font-semibold text-gray-800 transition-colors hover:bg-gray-300 active:bg-gray-400"
              >
                1
              </button>
              <button
                onClick={() => inputNumber('2')}
                className="rounded-lg bg-gray-200 px-4 py-4 text-xl font-semibold text-gray-800 transition-colors hover:bg-gray-300 active:bg-gray-400"
              >
                2
              </button>
              <button
                onClick={() => inputNumber('3')}
                className="rounded-lg bg-gray-200 px-4 py-4 text-xl font-semibold text-gray-800 transition-colors hover:bg-gray-300 active:bg-gray-400"
              >
                3
              </button>
              <button
                onClick={handleEquals}
                className="row-span-2 rounded-lg bg-green-500 px-4 py-4 text-xl font-semibold text-white transition-colors hover:bg-green-600 active:bg-green-700"
              >
                =
              </button>

              {/* Row 5 */}
              <button
                onClick={() => inputNumber('0')}
                className="col-span-2 rounded-lg bg-gray-200 px-4 py-4 text-xl font-semibold text-gray-800 transition-colors hover:bg-gray-300 active:bg-gray-400"
              >
                0
              </button>
              <button
                onClick={inputDecimal}
                className="rounded-lg bg-gray-200 px-4 py-4 text-xl font-semibold text-gray-800 transition-colors hover:bg-gray-300 active:bg-gray-400"
              >
                .
              </button>
              {scientificMode && (
                <button
                  onClick={() => performOperation('^')}
                  className="rounded-lg bg-purple-500 px-4 py-4 text-xl font-semibold text-white transition-colors hover:bg-purple-600 active:bg-purple-700"
                >
                  ^
                </button>
              )}
            </div>
          </div>

          {/* History Panel */}
          {showHistory && (
            <div className="rounded-lg bg-gray-50 p-4 border-2 border-gray-200">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Calculation History</h2>
                <button
                  onClick={clearHistory}
                  className="rounded-lg bg-red-500 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                >
                  Clear
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {history.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No calculations yet</p>
                ) : (
                  history.map((entry, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-white p-3 shadow-sm border border-gray-200"
                    >
                      <div className="text-sm font-mono text-gray-700">
                        {entry.expression} = <span className="font-bold text-blue-600">{entry.result}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {format(entry.timestamp, 'MMM dd, yyyy HH:mm:ss')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
