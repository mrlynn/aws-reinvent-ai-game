import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader } from './components/ui/card';
import { Button } from './components/ui/button';

const Leaderboard = ({ onReturnToMainMenu }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    fetchLeaderboard();
    fetchActiveUsers();
    const interval = setInterval(fetchActiveUsers, 60000); // Update active users every minute
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('https://aws-reinvent-game-server.vercel.app/api/leaderboard');
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
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
    <div className="p-4 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">Leaderboard</h2>
          <p className="text-center">Active Users: {activeUsers}</p>
        </CardHeader>
        <CardContent>
          <ul>
            {leaderboard.map((player, index) => (
              <li key={player._id} className="mb-2">
                {index + 1}. {player.playerName} - {player.highScore}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Button 
        onClick={onReturnToMainMenu}
        className="mt-4 w-full"
      >
        Return to Main Menu
      </Button>
    </div>
  );
};

export default Leaderboard;