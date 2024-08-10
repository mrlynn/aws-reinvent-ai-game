import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader } from './components/ui/card';
import { Button } from './components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';

const mongoColors = {
  green: '#00ED64',
  darkBlue: '#001E2B',
  lightBlue: '#E3FCF7',
  gray: '#E8EDEB',
};

const games = [
  { id: 'aiWorkflow', name: 'AI Workflow Game' },
  { id: 'vectorSearch', name: 'Vector Search Game' },
  { id: 'timeSeries', name: 'Time Series Game' },
  { id: 'atlasTreasureHunt', name: 'Atlas Treasure Hunt' },
  { id: 'drawingGame', name: 'Drawing Game' }
];

const Leaderboard = ({ onReturnToMainMenu }) => {
  const [leaderboards, setLeaderboards] = useState({});
  const [activeUsers, setActiveUsers] = useState(0);
  const [selectedGame, setSelectedGame] = useState(games[0].id);

  useEffect(() => {
    fetchLeaderboards();
    fetchActiveUsers();
    const interval = setInterval(fetchActiveUsers, 60000); // Update active users every minute
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboards = async () => {
    try {
      const leaderboardData = {};
      for (const game of games) {
        const response = await axios.get(`https://aws-reinvent-game-server.vercel.app/api/leaderboard/${game.id}`);
        leaderboardData[game.id] = response.data;
      }
      setLeaderboards(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const response = await axios.get('https://aws-reinvent-game-server.vercel.app/api/activeUsers');
      setActiveUsers(response.data.activeUsers);
    } catch (error) {
      console.error('Error fetching active users:', error);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto" style={{ backgroundColor: mongoColors.gray, minHeight: '100vh' }}>
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-center" style={{ color: mongoColors.darkBlue }}>Leaderboard</h2>
          <p className="text-center" style={{ color: mongoColors.darkBlue }}>Active Users: {activeUsers}</p>
        </CardHeader>
        <CardContent>
          <Select value={selectedGame} onValueChange={setSelectedGame}>
            <SelectTrigger className="w-full mb-4" style={{ backgroundColor: mongoColors.lightBlue, color: mongoColors.darkBlue }}>
              <SelectValue placeholder="Select a game" />
            </SelectTrigger>
            <SelectContent>
              {games.map((game) => (
                <SelectItem key={game.id} value={game.id}>{game.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {leaderboards[selectedGame] ? (
            <ul>
              {leaderboards[selectedGame].map((player, index) => (
                <li key={player._id} className="mb-2" style={{ color: mongoColors.darkBlue }}>
                  {index + 1}. {player.playerName} - {player.highScore}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: mongoColors.darkBlue }}>No leaderboard data available for this game.</p>
          )}
        </CardContent>
      </Card>
      <Button 
        onClick={onReturnToMainMenu}
        className="mt-4 w-full"
        style={{ backgroundColor: mongoColors.darkBlue, color: 'white' }}
      >
        Return to Main Menu
      </Button>
    </div>
  );
};

export default Leaderboard;