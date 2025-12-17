import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search tasks...', // 搜索任务...
  debounceMs = 300
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced onChange
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange, value]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      marginBottom: '20px',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <label htmlFor="search-input" style={{ fontSize: '14px', fontWeight: '500' }}>
          Search 
        </label>  // 搜索
        <div style={{ position: 'relative' }}>
          <input
            id="search-input"
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '8px 36px 8px 12px',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
          {localValue && (
            <button
              onClick={handleClear}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6c757d',
                fontSize: '18px',
                padding: '0 4px',
                lineHeight: '1'
              }}
              title="Clear search" // 清除搜索
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
