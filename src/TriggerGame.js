import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader } from './components/ui/card';
import { Input } from './components/ui/input';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mongoColors = {
  green: '#00ED64',
  darkBlue: '#001E2B',
  lightBlue: '#E3FCF7',
  gray: '#E8EDEB',
};

const TriggerDrivenTimeSeriesGame = ({ onReturnToMainMenu }) => {
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [currentSeries, setCurrentSeries] = useState([]);
  const [players, setPlayers] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [events, setEvents] = useState([]);
  const [anomalyDetected, setAnomalyDetected] = useState(false);

  const addEvent = useCallback((eventText) => {
    setEvents(prev => [...prev, { time: new Date().toLocaleTimeString(), text: eventText }]);
  }, []);

  const updateLeaderboard = useCallback(() => {
    const updatedPlayers = players.map(player => ({
      ...player,
      score: player.score + (Math.random() * 10)
    }));
    setPlayers(updatedPlayers);
    setLeaderboard(updatedPlayers.sort((a, b) => b.score - a.score));
    addEvent("Leaderboard updated");
  }, [players, addEvent]);

  const checkPlayerActivity = useCallback(() => {
    const now = new Date();
    players.forEach(player => {
      if ((now - new Date(player.lastActive)) > 30000) { // 30 seconds of inactivity
        addEvent(`${player.name} has been inactive for 30 seconds`);
      }
    });
  }, [players, addEvent]);

  const generateAIInsight = useCallback(() => {
    const insight = `AI Insight: The trend appears to be ${Math.random() > 0.5 ? 'upward' : 'downward'} based on recent data`;
    addEvent(insight);
  }, [addEvent]);

  const simulateTriggers = useCallback(() => {
    updateLeaderboard();
    checkPlayerActivity();
    generateAIInsight();
  }, [updateLeaderboard, checkPlayerActivity, generateAIInsight]);

  const simulateDatabaseInsert = useCallback((dataPoint) => {
    if (dataPoint.value > 90 || dataPoint.value < 10) {
      setTimeout(() => {
        setAnomalyDetected(true);
        addEvent(`Anomaly detected: ${dataPoint.value}`);
      }, 500);
    }
  }, [addEvent]);

  const generateDataPoint = useCallback(() => {
    const now = new Date();
    const lastValue = currentSeries.length > 0 ? currentSeries[currentSeries.length - 1].value : 50;
    const newValue = Math.max(0, Math.min(100, lastValue + (Math.random() - 0.5) * 10));
    const dataPoint = {
      timestamp: now.toISOString(),
      value: Math.round(newValue * 100) / 100
    };
    setCurrentSeries(prev => [...prev, dataPoint].slice(-60));
    simulateDatabaseInsert(dataPoint);
  }, [currentSeries, simulateDatabaseInsert]);

  useEffect(() => {
    if (gameStarted) {
      const dataInterval = setInterval(generateDataPoint, 1000);
      const triggerInterval = setInterval(simulateTriggers, 5000);
      return () => {
        clearInterval(dataInterval);
        clearInterval(triggerInterval);
      };
    }
  }, [gameStarted, generateDataPoint, simulateTriggers]);

  const joinGame = useCallback(() => {
    if (playerName.trim() !== '') {
      setPlayers(prev => [...prev, { name: playerName, score: 0, lastActive: new Date() }]);
      setGameStarted(true);
      addEvent(`${playerName} joined the game`);
    }
  }, [playerName, addEvent]);

  const makePrediction = useCallback((predictedTrend) => {
    setPrediction(predictedTrend);
    setPlayers(prevPlayers => prevPlayers.map(player => 
      player.name === playerName 
        ? { ...player, lastActive: new Date() }
        : player
    ));
  }, [playerName]);

  const formatXAxis = useCallback((tickItem) => {
    const date = new Date(tickItem);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, []);

  if (!gameStarted) {
    return (
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Trigger-Driven Time Series Challenge</h1>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="mb-4"
          />
          <Button onClick={joinGame} disabled={!playerName.trim()}>
            Join Game
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-4 grid grid-cols-3 gap-4">
      <Card className="col-span-2">
        <CardHeader>
          <h2 className="text-xl font-bold">Real-Time Data</h2>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={currentSeries}>
              <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
              <YAxis domain={[0, 100]} />
              <Tooltip labelFormatter={(label) => new Date(label).toLocaleString()} />
              <Line type="monotone" dataKey="value" stroke={mongoColors.darkBlue} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-around mt-4">
            <Button
              onClick={() => makePrediction('up')}
              className={prediction === 'up' ? 'bg-green-500' : ''}
            >
              Trend Up
            </Button>
            <Button
              onClick={() => makePrediction('down')}
              className={prediction === 'down' ? 'bg-red-500' : ''}
            >
              Trend Down
            </Button>
          </div>
          {anomalyDetected && (
            <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
              Anomaly Detected! Check the events log for details.
            </div>
          )}
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Leaderboard</h2>
          </CardHeader>
          <CardContent>
            {leaderboard.map((player, index) => (
              <div key={index} className="flex justify-between">
                <span>{player.name}</span>
                <span>{player.score.toFixed(2)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Trigger Events Log</h2>
          </CardHeader>
          <CardContent>
            <div className="h-40 overflow-y-auto">
              {events.map((event, index) => (
                <div key={index} className="text-sm">
                  <span className="font-bold">{event.time}:</span> {event.text}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Button className="col-span-3" onClick={onReturnToMainMenu}>
        Return to Main Menu
      </Button>
    </div>
  );
};

export default TriggerDrivenTimeSeriesGame;