import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>Environment Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={toggleVariables} className="mb-4">
          {showVariables ? 'Hide' : 'Show'} Environment Variables
        </Button>
        {showVariables && (
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
            {JSON.stringify(getReactAppEnvVars(), null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
};

export default DebugEnvironment;