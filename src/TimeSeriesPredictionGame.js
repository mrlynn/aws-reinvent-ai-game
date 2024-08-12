import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from './components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Define API URL based on environment
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
console.log("apiUrl: ", apiUrl);


const mongoColors = {
    green: '#00ED64',
    darkBlue: '#001E2B',
    lightBlue: '#E3FCF7',
    gray: '#E8EDEB',
  };

const AdvancedTimeSeriesGame = ({ onReturnToMainMenu }) => {
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [currentSeries, setCurrentSeries] = useState([]);
  const [score, setScore] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [lastPredictionCorrect, setLastPredictionCorrect] = useState(null);
  const [showDataStructure, setShowDataStructure] = useState(false);
  const [queryPerformance, setQueryPerformance] = useState({ timeSeries: 0, regular: 0 });
  const [aggregationResult, setAggregationResult] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const MAX_POINTS = 3600; // Store 1 hour of data points (1 per second)

  const generateDataPoint = useCallback(() => {
    const now = new Date();
    const lastValue = currentSeries.length > 0 ? currentSeries[currentSeries.length - 1].value : 50;
    const trend = prediction === 'up' ? 0.6 : prediction === 'down' ? 0.4 : 0.5;
    const newValue = Math.max(0, Math.min(100, lastValue + (Math.random() < trend ? 1 : -1) * Math.random() * 5));
    return {
      timestamp: now.toISOString(),
      value: Math.round(newValue * 100) / 100,
      metadata: {
        sensorId: 'sensor1',
        location: 'datacenter1'
      }
    };
  }, [currentSeries, prediction]);

  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(() => {
        setCurrentSeries(prev => {
          const newPoint = generateDataPoint();
          const newSeries = [...prev, newPoint].slice(-MAX_POINTS);
          
          if (prediction !== null && prev.length > 0) {
            const isCorrect = (prediction === 'up' && newPoint.value > prev[prev.length - 1].value) ||
                              (prediction === 'down' && newPoint.value < prev[prev.length - 1].value);
            setLastPredictionCorrect(isCorrect);
            setScore(prevScore => prevScore + (isCorrect ? 1 : 0));
          }
          
          return newSeries;
        });
        setPrediction(null);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameStarted, generateDataPoint, prediction]);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setCurrentSeries([]);
  };

  const makePrediction = (predictedTrend) => {
    setPrediction(predictedTrend);
  };

  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const simulateQuery = () => {
    const start = performance.now();
    // Simulate time series query
    // const tsResult = currentSeries.filter(point => 
    //   new Date(point.timestamp) > new Date(Date.now() - 3600000)
    // );
    const tsEnd = performance.now();

    // Simulate regular collection query
    const regStart = performance.now();
    // const regResult = currentSeries.filter(point => 
    //   new Date(point.timestamp) > new Date(Date.now() - 3600000)
    // );
    const regEnd = performance.now();

    setQueryPerformance({
      timeSeries: tsEnd - start,
      regular: regEnd - regStart
    });
  };

  const performAggregation = () => {
    const timeRanges = {
      '1h': 3600000,
      '30m': 1800000,
      '15m': 900000
    };
    const range = timeRanges[selectedTimeRange];
    const filtered = currentSeries.filter(point => 
      new Date(point.timestamp) > new Date(Date.now() - range)
    );
    const result = {
      avg: filtered.reduce((sum, point) => sum + point.value, 0) / filtered.length,
      min: Math.min(...filtered.map(point => point.value)),
      max: Math.max(...filtered.map(point => point.value))
    };
    setAggregationResult(result);
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
          expireAfterSeconds: 86400,
          bucketMaxSpanSeconds: 3600,
          bucketRoundingSeconds: 3600,
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
  
      <div className="mt-4 flex justify-center">
        <Button
          onClick={() => window.open('https://www.mongodb.com/docs/manual/core/timeseries-collections/', '_blank', 'noopener,noreferrer')}
          className="px-4 py-2 rounded flex items-center"
          style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}
        >
          Learn More About MongoDB Time Series Collections
          {/* If you're using an icon library, you can add an icon here */}
          {/* <FaExternalLinkAlt className="ml-2" /> */}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-4 max-w-md mx-auto" style={{ backgroundColor: mongoColors.gray }}>
      <Card>
        <CardHeader style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
          <h1 className="text-2xl font-bold text-center">Advanced MongoDB Time Series Game</h1>
          {gameStarted && <p className="text-center">Player: {playerName} | Score: {score}</p>}
        </CardHeader>
        <CardContent>
          {!gameStarted ? (
            <>
              <p className="text-center mb-4" style={{ color: mongoColors.darkBlue }}>
                Explore MongoDB's Time Series capabilities!
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
                  <LineChart data={currentSeries.slice(-60)}>
                    <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip labelFormatter={(label) => new Date(label).toLocaleString()} />
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
              <div className="mt-4">
                <Button onClick={simulateQuery} className="mr-2">Simulate Query</Button>
                {queryPerformance.timeSeries > 0 && (
                  <p>
                    Time Series: {queryPerformance.timeSeries.toFixed(2)}ms | 
                    Regular: {queryPerformance.regular.toFixed(2)}ms
                  </p>
                )}
              </div>
              <div className="mt-4">
                <select 
                  value={selectedTimeRange} 
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="mr-2"
                >
                  <option value="1h">Last 1 hour</option>
                  <option value="30m">Last 30 minutes</option>
                  <option value="15m">Last 15 minutes</option>
                </select>
                <Button onClick={performAggregation}>Aggregate Data</Button>
                {aggregationResult && (
                  <p>
                    Avg: {aggregationResult.avg.toFixed(2)} | 
                    Min: {aggregationResult.min.toFixed(2)} | 
                    Max: {aggregationResult.max.toFixed(2)}
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

export default AdvancedTimeSeriesGame;