import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader } from './components/ui/card';
import { Input } from './components/ui/input';

const mongoColors = {
  green: '#00ED64',
  darkBlue: '#001E2B',
  lightBlue: '#E3FCF7',
  gray: '#E8EDEB',
};

const AITreasureHuntGame = ({ onReturnToMainMenu }) => {
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentClue, setCurrentClue] = useState(null);
  const [aiCluesRemaining, setAiCluesRemaining] = useState(3);
  const [playerAnswer, setPlayerAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [events, setEvents] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:5000/api/startGame', { playerName });
      console.log(response.data.message);
      setGameStarted(true);
      setIsLoading(false);
      getNewClue();
    } catch (error) {
      console.error('Failed to start game:', error);
      setError('Failed to start game');
      setIsLoading(false);
    }
  }, [playerName]);

  const getNewClue = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5000/api/getClue');
      console.log('New clue:', response.data.clue);
      setCurrentClue(response.data.clue);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to get clue:', error);
      setError('Failed to get clue');
      setIsLoading(false);
    }
  }, []);

  const generateAIClue = useCallback(async () => {
    if (aiCluesRemaining <= 0) {
      addEvent("No more AI clues remaining!");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/generateAIClue');
      console.log('Generated AI Clue:', response.data.clue);
      setCurrentClue(response.data.clue);
      setAiCluesRemaining(prev => prev - 1);
      addEvent("An AI-generated clue has appeared!");
    } catch (error) {
      setError('Failed to generate AI clue. Please try again.');
      console.error('Failed to generate AI clue:', error);
    } finally {
      setIsLoading(false);
    }
  }, [aiCluesRemaining]);

  const useVectorSearchHint = useCallback(async () => {
    if (!currentClue) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5000/api/getVectorSearchHint?clueId=${currentClue.id}`);
      console.log('Vector Search Hint:', response.data.hint);
      addEvent(`Vector Search hint: ${response.data.hint}`);
    } catch (error) {
      setError('Failed to get vector search hint. Please try again.');
      console.error('Failed to get vector search hint:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentClue]);

  const submitAnswer = useCallback(async () => {
    if (!currentClue || !playerAnswer.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/api/submitAnswer', {
        clueId: currentClue.id,
        answer: playerAnswer
      });
      console.log('Answer submission result:', response.data);
      if (response.data.correct) {
        setScore(prevScore => prevScore + response.data.points);
        addEvent(`Correct answer! You earned ${response.data.points} points.`);
        getNewClue();
      } else {
        addEvent("Incorrect answer. Try again!");
      }
      setPlayerAnswer('');
    } catch (error) {
      setError('Failed to submit answer. Please try again.');
      console.error('Failed to submit answer:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentClue, playerAnswer, getNewClue]);

  const addEvent = (event) => {
    const time = new Date().toLocaleTimeString();
    setEvents(prevEvents => [...prevEvents, { time, text: event }]);
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/leaderboard');
        console.log('Leaderboard:', response.data);
        setLeaderboard(response.data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      }
    };

    if (gameStarted) {
      const leaderboardInterval = setInterval(fetchLeaderboard, 5000);
      const timerInterval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            clearInterval(timerInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(leaderboardInterval);
        clearInterval(timerInterval);
      };
    }
  }, [gameStarted]);

  if (!gameStarted) {
    return (
      <div className="p-4 max-w-md mx-auto" style={{ backgroundColor: mongoColors.gray, minHeight: '100vh' }}>
        <Card style={{ backgroundColor: 'white' }}>
          <CardHeader style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
            <h1 className="text-2xl font-bold text-center">Atlas Treasure Hunt</h1>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="mb-4"
              style={{ borderColor: mongoColors.darkBlue }}
            />
            <Button 
              onClick={startGame} 
              disabled={!playerName.trim() || isLoading}
              className="w-full"
              style={{ backgroundColor: mongoColors.darkBlue, color: 'white' }}
            >
              {isLoading ? 'Starting...' : 'Join the Hunt'}
            </Button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto" style={{ backgroundColor: mongoColors.gray, minHeight: '100vh' }}>
      <Card style={{ backgroundColor: 'white', marginBottom: '1rem' }}>
        <CardHeader style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
          <h2 className="text-xl font-bold">Current Clue</h2>
          <p>Time Remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</p>
          <p>Score: {score}</p>
        </CardHeader>
        <CardContent>
          <p className="mb-4" style={{ color: mongoColors.darkBlue }}>
            {isLoading ? 'Loading clue...' : currentClue?.clue || "No clue available"}
          </p>
          <Input
            type="text"
            value={playerAnswer}
            onChange={(e) => setPlayerAnswer(e.target.value)}
            placeholder="Your answer"
            className="mb-4"
            style={{ borderColor: mongoColors.darkBlue }}
          />
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <Button 
              onClick={submitAnswer} 
              disabled={!currentClue || isLoading}
              style={{ backgroundColor: mongoColors.darkBlue, color: 'white' }}
            >
              Submit Answer
            </Button>
            <Button 
              onClick={generateAIClue}
              disabled={aiCluesRemaining <= 0 || isLoading}
              style={{ 
                backgroundColor: aiCluesRemaining > 0 ? mongoColors.lightBlue : mongoColors.gray, 
                color: mongoColors.darkBlue 
              }}
            >
              Generate AI Clue ({aiCluesRemaining} left)
            </Button>
            <Button 
              onClick={useVectorSearchHint}
              disabled={!currentClue || isLoading}
              style={{ backgroundColor: mongoColors.lightBlue, color: mongoColors.darkBlue }}
            >
              Use Vector Search Hint
            </Button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </CardContent>
      </Card>
      
      <Card style={{ backgroundColor: 'white', marginBottom: '1rem' }}>
        <CardHeader style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
          <h2 className="text-xl font-bold">Leaderboard</h2>
        </CardHeader>
        <CardContent>
          {leaderboard.map((player, index) => (
            <div key={index} className="flex justify-between" style={{ color: mongoColors.darkBlue }}>
              <span>{player.name}</span>
              <span>{player.score}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Card style={{ backgroundColor: 'white', marginBottom: '1rem' }}>
        <CardHeader style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
          <h2 className="text-xl font-bold">Event Log</h2>
        </CardHeader>
        <CardContent>
          <div className="h-40 overflow-y-auto">
            {events.map((event, index) => (
              <div key={index} className="text-sm" style={{ color: mongoColors.darkBlue }}>
                <span className="font-bold">{event.time}:</span> {event.text}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Button 
        className="w-full" 
        onClick={onReturnToMainMenu}
        style={{ backgroundColor: mongoColors.darkBlue, color: 'white' }}
      >
        Return to Main Menu
      </Button>
    </div>
  );
};

export default AITreasureHuntGame;