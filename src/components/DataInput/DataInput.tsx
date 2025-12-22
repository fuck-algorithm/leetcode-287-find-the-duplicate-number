import { useState, useCallback } from 'react';
import { validateInput, generateRandomArray, EXAMPLE_DATA } from '../../utils/validation';
import type { InputData } from '../../types';
import './DataInput.css';

interface DataInputProps {
  onDataChange: (data: InputData) => void;
  currentData: number[];
}

const DataInput: React.FC<DataInputProps> = ({ onDataChange, currentData }) => {
  const [inputValue, setInputValue] = useState<string>(JSON.stringify(currentData));
  const [error, setError] = useState<string>('');

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.trim()) {
      const result = validateInput(value);
      if (result.isValid) {
        setError('');
        onDataChange(result);
      } else {
        setError(result.errorMessage || '输入无效');
      }
    }
  }, [onDataChange]);

  const handleExampleClick = useCallback((data: number[]) => {
    const jsonStr = JSON.stringify(data);
    setInputValue(jsonStr);
    setError('');
    onDataChange({ nums: data, isValid: true });
  }, [onDataChange]);

  const handleRandomClick = useCallback(() => {
    const size = Math.floor(Math.random() * 6) + 5;
    const randomData = generateRandomArray(size);
    const jsonStr = JSON.stringify(randomData);
    setInputValue(jsonStr);
    setError('');
    onDataChange({ nums: randomData, isValid: true });
  }, [onDataChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const result = validateInput(inputValue);
      if (result.isValid) {
        setError('');
        onDataChange(result);
      } else {
        setError(result.errorMessage || '输入无效');
      }
    }
  }, [inputValue, onDataChange]);

  return (
    <div className="data-input-container">
      <div className="input-row">
        <label className="input-label">输入数组：</label>
        <input
          type="text"
          className={`input-field ${error ? 'input-error' : ''}`}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="例如: [1,3,4,2,2] 或 1,3,4,2,2"
        />
        <button className="random-btn" onClick={handleRandomClick}>
          🎲 随机生成
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="examples-row">
        <span className="examples-label">示例数据：</span>
        {EXAMPLE_DATA.map((example, index) => (
          <button
            key={index}
            className="example-btn"
            onClick={() => handleExampleClick(example.value)}
          >
            {example.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DataInput;
