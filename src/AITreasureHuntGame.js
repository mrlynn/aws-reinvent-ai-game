import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader } from './components/ui/card';
import { Input } from './components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './components/ui/alert-dialog';

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
  const [round, setRound] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [events, setEvents] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes per round
  const [gameStarted, setGameStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [roundScore, setRoundScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const MAX_SCORE_PER_ROUND = 100;
  const TOTAL_ROUNDS = 5;

  const startGame = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.post('https://aws-reinvent-game-server.vercel.app/api/startTreasureHunt', { playerName });
      console.log(response.data.message);
      setGameStarted(true);
      setScore(0);
      setRound(1);
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
      const response = await axios.get('https://aws-reinvent-game-server.vercel.app/api/getTreasureClue');
      console.log('New clue:', response.data.clue);
      setCurrentClue(response.data.clue);
      setTimeRemaining(300); // Reset timer for new round
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to get clue:', error);
      setError('Failed to get clue');
      setIsLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(async () => {
    if (!currentClue || !playerAnswer.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('https://aws-reinvent-game-server.vercel.app/api/submitTreasureAnswer', {
        clueId: currentClue.id,
        answer: playerAnswer
      });
      console.log('Answer submission result:', response.data);
      setRoundScore(response.data.score);
      setScore(prevScore => prevScore + response.data.score);
      setShowResult(true);
      
      if (round === TOTAL_ROUNDS) {
        setGameOver(true);
        await saveScore(score + response.data.score);
      }
    } catch (error) {
      setError('Failed to submit answer. Please try again.');
      console.error('Failed to submit answer:', error);
    } finally {
      setIsLoading(false);
      setPlayerAnswer('');
    }
  }, [currentClue, playerAnswer, round, score]);

  const saveScore = async (finalScore) => {
    try {
      await axios.post('https://aws-reinvent-game-server.vercel.app/api/saveScore', {
        playerName,
        game: 'atlasTreasureHunt',
        score: finalScore,
        maxScore: MAX_SCORE_PER_ROUND * TOTAL_ROUNDS
      });
      console.log('Score saved successfully');
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const nextRound = useCallback(() => {
    if (round < TOTAL_ROUNDS) {
      setRound(prevRound => prevRound + 1);
      getNewClue();
    } else {
      setGameOver(true);
    }
  }, [round, TOTAL_ROUNDS, getNewClue]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('https://aws-reinvent-game-server.vercel.app/api/leaderboard/atlasTreasureHunt');
        setLeaderboard(response.data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      }
    };

    if (gameStarted) {
      const leaderboardInterval = setInterval(fetchLeaderboard, 30000);
      const timerInterval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            clearInterval(timerInterval);
            submitAnswer(); // Auto-submit when time runs out
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
  }, [gameStarted, submitAnswer]);

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
              {isLoading ? 'Starting...' : 'Start Treasure Hunt'}
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
          <h2 className="text-xl font-bold">Atlas Treasure Hunt</h2>
          <p>Player: {playerName}</p>
          <p>Score: {score}/{MAX_SCORE_PER_ROUND * TOTAL_ROUNDS} | Round: {round}/{TOTAL_ROUNDS}</p>
          <p>Time remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</p>
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
          <Button 
            onClick={submitAnswer} 
            disabled={!currentClue || isLoading}
            style={{ backgroundColor: mongoColors.darkBlue, color: 'white' }}
          >
            Submit Answer
          </Button>
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
              <span>{player.playerName}</span>
              <span>{player.highScore}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Button 
        className="w-full" 
        onClick={onReturnToMainMenu}
        style={{ backgroundColor: mongoColors.darkBlue, color: 'white' }}
      >
        Return to Main Menu
      </Button>

      <AlertDialog open={showResult} onOpenChange={setShowResult}>
        <AlertDialogContent style={{ backgroundColor: 'white', color: mongoColors.darkBlue }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Round Result</AlertDialogTitle>
            <AlertDialogDescription>
              <p>Your score this round: {roundScore}/{MAX_SCORE_PER_ROUND}</p>
              <p>Total score: {score}/{MAX_SCORE_PER_ROUND * TOTAL_ROUNDS}</p>
              {round < TOTAL_ROUNDS ? "Get ready for the next round!" : `Game Over! Your final score is ${score}/${MAX_SCORE_PER_ROUND * TOTAL_ROUNDS}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setShowResult(false);
              if (round < TOTAL_ROUNDS) nextRound();
              else setGameOver(true);
            }} style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
              {round < TOTAL_ROUNDS ? "Next Round" : "Finish Game"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={gameOver} onOpenChange={setGameOver}>
        <AlertDialogContent style={{ backgroundColor: 'white', color: mongoColors.darkBlue }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Game Over</AlertDialogTitle>
            <AlertDialogDescription>
              <p>Congratulations! You've completed the Atlas Treasure Hunt.</p>
              <p>Your final score: {score}/{MAX_SCORE_PER_ROUND * TOTAL_ROUNDS}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setGameOver(false);
              onReturnToMainMenu();
            }} style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
              Return to Main Menu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AITreasureHuntGame;