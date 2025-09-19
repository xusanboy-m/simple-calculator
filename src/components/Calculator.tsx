import React, { useState, useEffect, useCallback } from 'react';
import { Moon, Sun } from 'lucide-react';

// Calculator component with dark/light mode toggle
const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode and update document class
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      document.documentElement.classList.toggle('dark', newMode);
      return newMode;
    });
  }, []);

  // Initialize dark mode based on system preference
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);
  }, []);

  // Handle number input
  const inputNumber = useCallback((num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  }, [display, waitingForNewValue]);

  // Handle operator input
  const inputOperation = useCallback((nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      if (newValue === 'Error') {
        setDisplay('Error');
        setPreviousValue(null);
        setOperation(null);
        setWaitingForNewValue(true);
        return;
      }

      setDisplay(String(newValue));
      setPreviousValue(typeof newValue === 'number' ? newValue : null);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  }, [display, previousValue, operation]);

  // Perform calculation with operator precedence
  const calculate = (firstValue: number, secondValue: number, operation: string): number | string => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        if (secondValue === 0) return 'Error';
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  // Handle equals button
  const performCalculation = useCallback(() => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      
      if (newValue === 'Error') {
        setDisplay('Error');
        setPreviousValue(null);
        setOperation(null);
        setWaitingForNewValue(true);
        return;
      }

      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  }, [display, previousValue, operation]);

  // Clear all
  const clearAll = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  }, []);

  // Backspace
  const backspace = useCallback(() => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  }, [display]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const { key } = event;
      
      if (key >= '0' && key <= '9') {
        inputNumber(key);
      } else if (['+', '-', '*', '/'].includes(key)) {
        inputOperation(key);
      } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        performCalculation();
      } else if (key === 'Backspace') {
        event.preventDefault();
        backspace();
      } else if (key === 'Escape') {
        clearAll();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [inputNumber, inputOperation, performCalculation, backspace, clearAll]);

  // Button component with proper styling
  const CalcButton: React.FC<{
    onClick: () => void;
    children: React.ReactNode;
    variant?: 'digit' | 'operator' | 'special';
    className?: string;
    'aria-label'?: string;
  }> = ({ onClick, children, variant = 'digit', className = '', 'aria-label': ariaLabel }) => {
    const baseClasses = "h-16 rounded-2xl font-semibold text-lg transition-all duration-200 ease-out transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent shadow-lg";
    
    const variantClasses = {
      digit: "bg-calc-button-digit hover:bg-calc-button-digit-hover text-calc-button-digit-text shadow-calc-shadow hover:shadow-calc-shadow-hover",
      operator: "bg-calc-button-operator hover:bg-calc-button-operator-hover text-calc-button-operator-text shadow-calc-shadow hover:shadow-calc-shadow-hover",
      special: "bg-calc-button-special hover:bg-calc-button-special-hover text-calc-button-special-text shadow-calc-shadow hover:shadow-calc-shadow-hover"
    };

    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        aria-label={ariaLabel}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-sm mx-auto">
        {/* Header with dark mode toggle */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Calculator</h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Calculator body */}
        <div className="bg-card rounded-3xl p-6 shadow-2xl">
          {/* Display */}
          <div className="bg-calc-display rounded-2xl p-6 mb-6 min-h-[80px] flex items-center justify-end shadow-inner">
            <div
              className="text-calc-display-text text-4xl font-light text-right overflow-hidden"
              aria-live="polite"
              aria-label={`Display: ${display}`}
            >
              {display}
            </div>
          </div>

          {/* Button grid */}
          <div className="grid grid-cols-4 gap-3">
            {/* Row 1: Clear, Backspace, Empty, Divide */}
            <CalcButton onClick={clearAll} variant="special" className="col-span-2" aria-label="Clear all">
              C
            </CalcButton>
            <CalcButton onClick={backspace} variant="special" aria-label="Backspace">
              ⌫
            </CalcButton>
            <CalcButton onClick={() => inputOperation('/')} variant="operator" aria-label="Divide">
              ÷
            </CalcButton>

            {/* Row 2: 7, 8, 9, Multiply */}
            <CalcButton onClick={() => inputNumber('7')} aria-label="Seven">7</CalcButton>
            <CalcButton onClick={() => inputNumber('8')} aria-label="Eight">8</CalcButton>
            <CalcButton onClick={() => inputNumber('9')} aria-label="Nine">9</CalcButton>
            <CalcButton onClick={() => inputOperation('*')} variant="operator" aria-label="Multiply">
              ×
            </CalcButton>

            {/* Row 3: 4, 5, 6, Subtract */}
            <CalcButton onClick={() => inputNumber('4')} aria-label="Four">4</CalcButton>
            <CalcButton onClick={() => inputNumber('5')} aria-label="Five">5</CalcButton>
            <CalcButton onClick={() => inputNumber('6')} aria-label="Six">6</CalcButton>
            <CalcButton onClick={() => inputOperation('-')} variant="operator" aria-label="Subtract">
              −
            </CalcButton>

            {/* Row 4: 1, 2, 3, Add */}
            <CalcButton onClick={() => inputNumber('1')} aria-label="One">1</CalcButton>
            <CalcButton onClick={() => inputNumber('2')} aria-label="Two">2</CalcButton>
            <CalcButton onClick={() => inputNumber('3')} aria-label="Three">3</CalcButton>
            <CalcButton onClick={() => inputOperation('+')} variant="operator" aria-label="Add">
              +
            </CalcButton>

            {/* Row 5: 0 (span 2), Decimal, Equals */}
            <CalcButton onClick={() => inputNumber('0')} className="col-span-2" aria-label="Zero">
              0
            </CalcButton>
            <CalcButton onClick={() => inputNumber('.')} aria-label="Decimal point">
              .
            </CalcButton>
            <CalcButton onClick={performCalculation} variant="operator" aria-label="Equals">
              =
            </CalcButton>
          </div>
        </div>

        {/* Keyboard shortcuts help */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Use keyboard: 0-9, +−×÷, Enter (=), Backspace (⌫), Esc (C)
        </div>
      </div>
    </div>
  );
};

export default Calculator;