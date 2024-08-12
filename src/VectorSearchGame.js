import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from './components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './components/ui/alert-dialog';

const mongoColors = {
  green: '#00ED64',
  darkBlue: '#001E2B',
  lightBlue: '#E3FCF7',
  gray: '#E8EDEB',
};

const DrawingGame = ({ onReturnToMainMenu }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timer, setTimer] = useState(60);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState(null);
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
  }, []);

  const startGame = async () => {
    setGameStarted(true);
    await nextRound();
  };

  const nextRound = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/getRandomPrompt');
      setCurrentPrompt(response.data.prompt);
      setRound(prev => prev + 1);
      setTimer(60);
      clearCanvas();
    } catch (error) {
      console.error('Error fetching prompt:', error);
    }
  }, []);

  const startDrawing = (event) => {
    const { offsetX, offsetY } = getCoordinates(event);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = (event) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(event);
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
  };

  const getCoordinates = (event) => {
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
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const submitDrawing = async () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');
    
    try {
      const response = await axios.post('http://localhost:5000/api/checkDrawing', {
        prompt: currentPrompt,
        drawing: imageData
      });

      setScore(prev => Math.min(prev + response.data.score, MAX_SCORE));
      setFeedback(response.data);
      setShowResult(true);
    } catch (error) {
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
    setScore(0);
    setRound(0);
    setShowResult(false);
  };

  return (
    <div className="p-4 max-w-md mx-auto" style={{ backgroundColor: mongoColors.gray }}>
      <Card>
        <CardHeader style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
          <h1 className="text-2xl font-bold text-center">MongoDB Drawing Game</h1>
          {gameStarted && (
            <>
              <p className="text-center">Score: {score}/{MAX_SCORE} | Round: {round}/{ROUNDS}</p>
              <p className="text-center">Time remaining: {timer}s</p>
              <p className="text-center font-bold">Draw: {currentPrompt}</p>
            </>
          )}
        </CardHeader>
        <CardContent>
          {!gameStarted ? (
            <p className="text-center mb-4" style={{ color: mongoColors.darkBlue }}>
              Welcome to the Drawing Game! Click the button below to start.
            </p>
          ) : (
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
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!gameStarted ? (
            <Button 
              onClick={startGame} 
              className="px-4 py-2 rounded" 
              style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}
            >
              Start Game
            </Button>
          ) : (
            <>
              <Button onClick={submitDrawing} className="px-4 py-2 rounded mr-2" style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
                Submit Drawing
              </Button>
              <Button onClick={clearCanvas} className="px-4 py-2 rounded mr-2" style={{ backgroundColor: mongoColors.lightBlue, color: mongoColors.darkBlue }}>
                Clear Canvas
              </Button>
              <Button onClick={onReturnToMainMenu} className="px-4 py-2 rounded" style={{ backgroundColor: mongoColors.lightBlue, color: mongoColors.darkBlue }}>
                Main Menu
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
      
      <AlertDialog open={showResult} onOpenChange={setShowResult}>
        <AlertDialogContent style={{ backgroundColor: 'white', color: mongoColors.darkBlue }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Round Result</AlertDialogTitle>
            <AlertDialogDescription>
              {feedback && (
                <>
                  <p>Your score this round: {feedback.score.toFixed(2)}%</p>
                  <p>Similarity to "{currentPrompt}": {feedback.similarity.toFixed(2)}%</p>
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
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DrawingGame;