import React, { useState } from 'react';

const DebugEnvironment = () => {
  const [showVariables, setShowVariables] = useState(false);

  const toggleVariables = () => {
    setShowVariables(!showVariables);
  };

  const getReactAppEnvVars = () => {
    return Object.entries(process.env)
      .filter(([key]) => key.startsWith('REACT_APP_'))
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
  };

  return (
    <div className="debug-environment" style={{ margin: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h3>Environment Debug</h3>
      <button onClick={toggleVariables} style={{ marginBottom: '10px' }}>
        {showVariables ? 'Hide' : 'Show'} Environment Variables
      </button>
      {showVariables && (
        <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px', overflow: 'auto', maxHeight: '300px' }}>
          {JSON.stringify(getReactAppEnvVars(), null, 2)}
        </pre>
      )}
    </div>
  );
};

export default DebugEnvironment;