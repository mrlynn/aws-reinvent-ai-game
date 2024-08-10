import React from 'react';

const Select = ({ value, onValueChange, children }) => {
  return (
    <select 
      value={value} 
      onChange={(e) => onValueChange(e.target.value)}
      style={{
        width: '100%',
        padding: '10px',
        marginBottom: '1rem',
        backgroundColor: '#E3FCF7',
        color: '#001E2B',
        border: '1px solid #001E2B',
        borderRadius: '4px',
        fontSize: '1rem'
      }}
    >
      {children}
    </select>
  );
};

const SelectTrigger = ({ children }) => children;

const SelectContent = ({ children }) => children;

const SelectItem = ({ children, value }) => (
  <option value={value}>{children}</option>
);

const SelectValue = ({ placeholder }) => placeholder;

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };