import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from './components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './components/ui/alert-dialog';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mongoColors = {
    green: '#00ED64',
    darkBlue: '#001E2B',
    lightBlue: '#E3FCF7',
    gray: '#E8EDEB',
  };

const TrendPredictionGame = ({ onReturnToMainMenu }) => {
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [currentSeries, setCurrentSeries] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [lastPredictionCorrect, setLastPredictionCorrect] = useState(null);
  const [showDataStructure, setShowDataStructure] = useState(false);
  const MAX_POINTS = 50;

  const generateDataPoint = useCallback(() => {
    const now = new Date();
    const lastValue = currentSeries.length > 0 ? currentSeries[currentSeries.length - 1].value : 50;
    const trend = prediction === 'up' ? 0.6 : prediction === 'down' ? 0.4 : 0.5;
    const newValue = Math.max(0, Math.min(100, lastValue + (Math.random() < trend ? 1 : -1) * Math.random() * 5));
    return {
      timestamp: now.toISOString(),
      value: Math.round(newValue * 100) / 100
    };
  }, [currentSeries, prediction]);

  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(() => {
        setCurrentSeries(prev => {
          const newPoint = generateDataPoint();
          const newSeries = [...prev, newPoint].slice(-MAX_POINTS);
          
          // Check if prediction was correct
          if (prediction !== null && prev.length > 0) {
            const isCorrect = (prediction === 'up' && newPoint.value > prev[prev.length - 1].value) ||
                              (prediction === 'down' && newPoint.value < prev[prev.length - 1].value);
            setLastPredictionCorrect(isCorrect);
            setScore(prevScore => prevScore + (isCorrect ? 1 : 0));
            setStreak(prevStreak => isCorrect ? prevStreak + 1 : 0);
          }
          
          return newSeries;
        });
        setPrediction(null);
      }, 1000);  // Generate a new point every second
      return () => clearInterval(interval);
    }
  }, [gameStarted, generateDataPoint, prediction]);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setStreak(0);
    setCurrentSeries([]);
  };

  const makePrediction = (predictedTrend) => {
    setPrediction(predictedTrend);
  };

  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const renderDataStructure = () => (
    <div className="mt-4 p-4 bg-gray-100 rounded">
      <h3 className="font-bold mb-2">MongoDB Time Series Collection Structure:</h3>
      <pre className="text-xs overflow-x-auto">
        {JSON.stringify({
          name: "sensor_data",
          type: "timeseries",
          timeField: "timestamp",
          metaField: "metadata",
          granularity: "seconds",
        }, null, 2)}
      </pre>
  
      <h3 className="font-bold mt-4 mb-2">Time Series Index Definition:</h3>
      <pre className="text-xs overflow-x-auto">
        {JSON.stringify({
          timeField: "timestamp",
          metaField: "metadata",
          granularity: "seconds",
          expireAfterSeconds: 86400, // Optional: data expires after 24 hours
          bucketMaxSpanSeconds: 3600, // Optional: maximum time range for a bucket
          bucketRoundingSeconds: 3600, // Optional: rounds bucket boundaries to the nearest hour
        }, null, 2)}
      </pre>
  
      <h3 className="font-bold mt-4 mb-2">Sample Document:</h3>
      <pre className="text-xs overflow-x-auto">
        {JSON.stringify(currentSeries[currentSeries.length - 1], null, 2)}
      </pre>
  
      <p className="mt-4 text-sm" style={{ color: mongoColors.darkBlue }}>
        The time series index optimizes storage and query performance for time-based data.
        It automatically creates and manages buckets of documents based on the time field,
        allowing for efficient range queries and aggregations.
      </p>
    </div>
  );

  return (
    <div className="p-4 max-w-md mx-auto" style={{ backgroundColor: mongoColors.gray }}>
      <Card>
        <CardHeader style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
          <h1 className="text-2xl font-bold text-center">MongoDB Real-Time Trend Prediction</h1>
          {gameStarted && (
            <>
              <p className="text-center">Player: {playerName}</p>
              <p className="text-center">Score: {score} | Streak: {streak}</p>
            </>
          )}
        </CardHeader>
        <CardContent>
          {!gameStarted ? (
            <>
              <p className="text-center mb-4" style={{ color: mongoColors.darkBlue }}>
                Predict real-time trends in MongoDB time series data!
              </p>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-2 mb-4 border rounded"
                style={{ borderColor: mongoColors.darkBlue }}
              />
            </>
          ) : (
            <>
              <div className="mb-4">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={currentSeries}>
                    <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      labelFormatter={(label) => new Date(label).toLocaleString()} 
                      formatter={(value) => [value, "Value"]}
                    />
                    <Line type="monotone" dataKey="value" stroke={mongoColors.darkBlue} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex justify-around mt-4">
                  <Button
                    onClick={() => makePrediction('up')}
                    className="px-4 py-2 rounded"
                    style={{ backgroundColor: prediction === 'up' ? mongoColors.darkBlue : mongoColors.lightBlue, color: prediction === 'up' ? 'white' : mongoColors.darkBlue }}
                  >
                    Trend Up
                  </Button>
                  <Button
                    onClick={() => makePrediction('down')}
                    className="px-4 py-2 rounded"
                    style={{ backgroundColor: prediction === 'down' ? mongoColors.darkBlue : mongoColors.lightBlue, color: prediction === 'down' ? 'white' : mongoColors.darkBlue }}
                  >
                    Trend Down
                  </Button>
                </div>
                {lastPredictionCorrect !== null && (
                  <p className="text-center mt-4" style={{ color: lastPredictionCorrect ? 'green' : 'red' }}>
                    {lastPredictionCorrect ? 'Correct!' : 'Incorrect!'}
                  </p>
                )}
              </div>
              <Button
                onClick={() => setShowDataStructure(!showDataStructure)}
                className="mt-4 px-4 py-2 rounded"
                style={{ backgroundColor: mongoColors.lightBlue, color: mongoColors.darkBlue }}
              >
                {showDataStructure ? "Hide" : "Show"} Data Structure
              </Button>
              {showDataStructure && renderDataStructure()}
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!gameStarted ? (
            <Button 
              onClick={startGame} 
              className="px-4 py-2 rounded" 
              style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}
              disabled={!playerName.trim()}
            >
              Start Game
            </Button>
          ) : (
            <Button 
              onClick={onReturnToMainMenu} 
              className="px-4 py-2 rounded" 
              style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}
            >
              End Game
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default TrendPredictionGame;