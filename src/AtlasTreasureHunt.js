import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from './components/ui/card';
import { Input } from './components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './components/ui/alert-dialog';

const mongoColors = {
    green: '#00ED64',
    darkBlue: '#001E2B',
    lightBlue: '#E3FCF7',
    gray: '#E8EDEB',
};

const AtlasTreasureHunt = ({ onReturnToMainMenu }) => {
    const [playerName, setPlayerName] = useState('');
    const [gameStarted, setGameStarted] = useState(false);
    const [currentClue, setCurrentClue] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(0);
    const [timer, setTimer] = useState(60);
    const [showResult, setShowResult] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [gameOver, setGameOver] = useState(false);

    const MAX_SCORE_PER_ROUND = 100;
    const TOTAL_ROUNDS = 5;

    const startGame = async () => {
        if (playerName.trim() !== '') {
            setGameStarted(true);
            setScore(0);
            setRound(1);
            await nextRound();
        }
    };

    const nextRound = useCallback(async () => {
        if (round <= TOTAL_ROUNDS) {
            try {
                setLoading(true);
                const response = await axios.get('https://aws-reinvent-game-server.vercel.app/api/getTreasureClue');
                setCurrentClue(response.data.clue);
                setLoading(false);
                setRound(prevRound => prevRound + 1);
                setTimer(60);
                setUserAnswer('');
            } catch (error) {
                console.error('Error fetching clue:', error);
                setLoading(false);
            }
        } else {
            setGameOver(true);
        }
    }, [round]);

    const submitAnswer = async () => {
        if (!currentClue) {
            console.error('No current clue available');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post('https://aws-reinvent-game-server.vercel.app/api/submitTreasureAnswer', {
                clueId: currentClue.id,
                answer: userAnswer
            });
            setLoading(false);

            setScore(prevScore => prevScore + response.data.score);
            setFeedback(response.data);
            setShowResult(true);

            if (round === TOTAL_ROUNDS) {
                setGameOver(true);
                await saveScore(score + response.data.score);
            }
        } catch (error) {
            setLoading(false);
            console.error('Error submitting answer:', error);
        }
    };

    const saveScore = async (finalScore) => {
        try {
            await axios.post('https://aws-reinvent-game-server.vercel.app/api/saveScore', {
                playerName,
                game: 'atlasTreasureHunt',
                score: finalScore,
                maxScore: MAX_SCORE_PER_ROUND * TOTAL_ROUNDS
            });
        } catch (error) {
            console.error('Error saving score:', error);
        }
    };

    useEffect(() => {
        if (gameStarted && round <= TOTAL_ROUNDS) {
            const interval = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer === 0) {
                        clearInterval(interval);
                        submitAnswer();
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
        setCurrentClue(null);
    };

    if (!gameStarted) {
        return (
            <div className="p-4 max-w-md mx-auto" style={{ backgroundColor: mongoColors.gray, minHeight: '100vh' }}>
                <Card style={{ backgroundColor: 'white' }}>
                    <CardHeader style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
                        <h1 className="text-2xl font-bold text-center">Atlas Treasure Hunt: Code Archaeologist</h1>
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
                        {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}
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
                    <h2 className="text-xl font-bold">Atlas Treasure Hunt: Code Archaeologist</h2>
                    <p>Player: {playerName}</p>
                    <p>Score: {score}/{MAX_SCORE_PER_ROUND * TOTAL_ROUNDS} | Round: {round}/{TOTAL_ROUNDS}</p>
                    <p>Time remaining: {timer}s</p>
                </CardHeader>
                <CardContent>
                    <p className="mb-4" style={{ color: mongoColors.darkBlue }}>
                        {currentClue ? `Clue: ${currentClue.clue}` : 'Loading...'}
                    </p>
                    <Input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Enter your answer"
                        className="mb-4"
                        style={{ borderColor: mongoColors.darkBlue }}
                    />
                    <Button
                        onClick={submitAnswer}
                        className="w-full"
                        style={{ backgroundColor: mongoColors.darkBlue, color: 'white' }}
                    >
                        Submit Answer
                    </Button>
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
                            {feedback && (
                                <>
                                    <p>Your answer: {userAnswer}</p>
                                    <p>Correct answer: {feedback.correctAnswer}</p>
                                    <p>Your score this round: {feedback.score}/{MAX_SCORE_PER_ROUND}</p>
                                    <p>Total score: {score}/{MAX_SCORE_PER_ROUND * TOTAL_ROUNDS}</p>
                                </>
                            )}
                            {round < TOTAL_ROUNDS ? "Get ready for the next clue!" : `Game Over! Your final score is ${score}/${MAX_SCORE_PER_ROUND * TOTAL_ROUNDS}`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => {
                            setShowResult(false);
                            if (round < TOTAL_ROUNDS) nextRound();
                            else resetGame();
                        }} style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
                            {round < TOTAL_ROUNDS ? "Next Clue" : "Play Again"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AtlasTreasureHunt;