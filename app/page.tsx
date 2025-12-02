'use client';

import { useState } from 'react';
import { evaluate } from 'mathjs';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [scientificMode, setScientificMode] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
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
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const performScientificFunction = (func: string) => {
    try {
      const value = parseFloat(display);
      let result: number;

      switch (func) {
        case 'sin':
          result = Math.sin(value);
          break;
        case 'cos':
          result = Math.cos(value);
          break;
        case 'tan':
          result = Math.tan(value);
          break;
        case 'log':
          result = Math.log10(value);
          break;
        case 'ln':
          result = Math.log(value);
          break;
        case 'sqrt':
          result = Math.sqrt(value);
          break;
        default:
          result = value;
      }

      setDisplay(String(result));
      setWaitingForNewValue(true);
    } catch (error) {
      setDisplay('Error');
      setWaitingForNewValue(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-blue-600">Scientific Calculator</h1>
          <button
            onClick={() => setScientificMode(!scientificMode)}
            className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-600"
          >
            {scientificMode ? 'Basic' : 'Scientific'}
          </button>
        </div>
        
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
    </div>
  );
}
