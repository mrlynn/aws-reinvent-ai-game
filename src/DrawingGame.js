import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from './components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './components/ui/alert-dialog';
import { Input } from './components/ui/input';

const mongoColors = {
  green: '#00ED64',
  darkBlue: '#001E2B',
  lightBlue: '#E3FCF7',
  gray: '#E8EDEB',
};

const DrawingGame = ({ onReturnToMainMenu }) => {
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timer, setTimer] = useState(60);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const MAX_SCORE = 500;
  const ROUNDS = 5;

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.strokeStyle = mongoColors.darkBlue;
      ctx.lineWidth = 2;
      ctxRef.current = ctx;
    }
  }, [gameStarted]);

  const startGame = async () => {
    if (playerName.trim() !== '') {
      setGameStarted(true);
      await nextRound();
    }
  };

  const nextRound = useCallback(async () => {
    try {
      console.log('Fetching new prompt...');
      const response = await axios.get('https://aws-reinvent-game-server.vercel.app/api/getRandomPrompt');
      console.log('Received response:', response);
      console.log('Response data:', response.data);

      if (response.data && response.data.text) {
        setCurrentPrompt(response.data);
        console.log('Set current prompt:', response.data);
        setRound(prev => prev + 1);
        setTimer(60);
        clearCanvas();
      } else {
        console.error('Received invalid prompt data:', response.data);
      }
    } catch (error) {
      console.error('Error fetching prompt:', error.response ? error.response.data : error.message);
    }
  }, []);

  const startDrawing = useCallback((event) => {
    if (!ctxRef.current) return;
    const { offsetX, offsetY } = getCoordinates(event);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  }, []);

  const finishDrawing = useCallback(() => {
    if (!ctxRef.current) return;
    ctxRef.current.closePath();
    setIsDrawing(false);
  }, []);

  const draw = useCallback((event) => {
    if (!isDrawing || !ctxRef.current) return;
    const { offsetX, offsetY } = getCoordinates(event);
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
  }, [isDrawing]);

  const getCoordinates = useCallback((event) => {
    if (!canvasRef.current) return { offsetX: 0, offsetY: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (event.touches && event.touches[0]) {
      return {
        offsetX: (event.touches[0].clientX - rect.left) * scaleX,
        offsetY: (event.touches[0].clientY - rect.top) * scaleY
      };
    }

    return {
      offsetX: (event.clientX - rect.left) * scaleX,
      offsetY: (event.clientY - rect.top) * scaleY
    };
  }, []);

  const clearCanvas = useCallback(() => {
    if (!ctxRef.current || !canvasRef.current) return;
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }, []);

  const submitDrawing = async () => {
    if (!currentPrompt) {
      console.error('No current prompt available');
      return;
    }

    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');

    const byteString = atob(imageData.split(',')[1]);
    const mimeString = imageData.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });

    const formData = new FormData();
    formData.append('drawing', blob, 'drawing.png');
    formData.append('promptId', currentPrompt.promptId);

    try {
      setLoading(true);
      const response = await axios.post('https://aws-reinvent-game-server.vercel.app/api/checkDrawing', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setLoading(false);

      setScore(prev => Math.min(prev + response.data.score, MAX_SCORE));
      setFeedback(response.data);
      setShowResult(true);
    } catch (error) {
      setLoading(false);
      console.error('Error submitting drawing:', error);
    }
  };

  useEffect(() => {
    if (gameStarted && round <= ROUNDS) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 0) {
            clearInterval(interval);
            submitDrawing();
            return 60;
          }
          return prevTimer - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameStarted, round]);

  const resetGame = () => {
    setGameStarted(false);
    setPlayerName('');
    setScore(0);
    setRound(0);
    setShowResult(false);
    setCurrentPrompt(null);
  };

  if (!gameStarted) {
    return (
      <div className="p-4 max-w-md mx-auto" style={{ backgroundColor: mongoColors.gray, minHeight: '100vh' }}>
        <Card style={{ backgroundColor: 'white' }}>
          <CardHeader style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
            <h1 className="text-2xl font-bold text-center">MongoDB Drawing Game</h1>
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
              disabled={!playerName.trim()}
              className="w-full"
              style={{ backgroundColor: mongoColors.darkBlue, color: 'white' }}
            >
              Start Game
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto" style={{ backgroundColor: mongoColors.gray, minHeight: '100vh' }}>
      {loading && (
        <div className="loader" style={{
          border: '16px solid #f3f3f3',
          borderRadius: '50%',
          borderTop: `16px solid ${mongoColors.darkBlue}`,
          width: '120px',
          height: '120px',
          animation: 'spin 2s linear infinite',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
        }} />
      )}
      <Card style={{ backgroundColor: 'white', marginBottom: '1rem' }}>
        <CardHeader style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
          <h2 className="text-xl font-bold">Drawing Game</h2>
          <p>Player: {playerName}</p>
          <p>Score: {score}/{MAX_SCORE} | Round: {round}/{ROUNDS}</p>
          <p>Time remaining: {timer}s</p>
        </CardHeader>
        <CardContent>
          <p className="mb-4" style={{ color: mongoColors.darkBlue }}>
            {currentPrompt ? `Draw: ${currentPrompt.description}` : 'Loading...'}
          </p>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseOut={finishDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={finishDrawing}
            onTouchMove={draw}
            className="border border-gray-300 mb-4"
            style={{ touchAction: 'none', width: '100%', height: '300px' }}
          />
          <div className="flex mb-4">
            <Button 
              onClick={submitDrawing}
              className="mr-2"
              style={{ backgroundColor: mongoColors.darkBlue, color: 'white' }}
            >
              Submit Drawing
            </Button>
            <Button 
              onClick={clearCanvas}
              style={{ backgroundColor: mongoColors.lightBlue, color: mongoColors.darkBlue }}
            >
              Clear Canvas
            </Button>
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

      <AlertDialog open={showResult} onOpenChange={setShowResult}>
        <AlertDialogContent style={{ backgroundColor: 'white', color: mongoColors.darkBlue }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Result</AlertDialogTitle>
            <AlertDialogDescription>
              {feedback && (
                <>
                  <p>Your score this round: {feedback.score}</p>
                  <p>Prompt: "{feedback.promptText}"</p>
                  <p>Answer: "{feedback.promptName}"</p>
                  <p>AI Explanation: {feedback.explanation}</p>
                </>
              )}
              <p>Your total score is {score}/{MAX_SCORE}!</p>
              {round < ROUNDS ? "Get ready for the next round!" : `Game Over! Your final score is ${score}/${MAX_SCORE}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setShowResult(false);
              if (round < ROUNDS) nextRound();
              else resetGame();
            }} style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
              {round < ROUNDS ? "Next Round" : "Play Again"}
            </AlertDialogAction>
            <AlertDialogAction onClick={onReturnToMainMenu} style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
              Return to Main Menu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DrawingGame;
