import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from './components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './components/ui/alert-dialog';

const mongoColors = {
  green: '#00ED64',
  darkBlue: '#001E2B',
  lightBlue: '#E3FCF7',
  gray: '#E8EDEB',
};

// Simulated document database with pre-computed embeddings
const documents = [
  { id: 1, content: "MongoDB offers scalable NoSQL database solutions.", embedding: [0.2, 0.8, 0.4] },
  { id: 2, content: "Vector search enables semantic similarity in queries.", embedding: [0.9, 0.1, 0.5] },
  { id: 3, content: "Cloud computing provides flexible infrastructure.", embedding: [0.3, 0.6, 0.7] },
  { id: 4, content: "Machine learning algorithms improve data analysis.", embedding: [0.7, 0.2, 0.8] },
  { id: 5, content: "Data security is crucial for business operations.", embedding: [0.5, 0.5, 0.6] },
  { id: 6, content: "Agile methodology enhances software development.", embedding: [0.1, 0.9, 0.3] },
  { id: 7, content: "Blockchain technology ensures data integrity.", embedding: [0.6, 0.4, 0.2] },
  { id: 8, content: "APIs facilitate seamless system integration.", embedding: [0.4, 0.7, 0.1] },
];

// Function to calculate cosine similarity
const cosineSimilarity = (A, B) => {
  let dotProduct = 0, mA = 0, mB = 0;
  for (let i = 0; i < A.length; i++) {
    dotProduct += A[i] * B[i];
    mA += A[i] * A[i];
    mB += B[i] * B[i];
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  return dotProduct / (mA * mB);
};

const VectorSearchGame = ({ onReturnToMainMenu }) => {
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [query, setQuery] = useState('');
  const [queryEmbedding, setQueryEmbedding] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timer, setTimer] = useState(60);
  const MAX_SCORE = 15; // New constant for maximum score


  const generateQueryEmbedding = () => {
    // In a real scenario, this would be done by a machine learning model
    return [Math.random(), Math.random(), Math.random()];
  };

  const startGame = () => {
    if (playerName.trim() !== '') {
      setGameStarted(true);
      nextRound();
    }
  };

  const nextRound = () => {
    const newQuery = documents[Math.floor(Math.random() * documents.length)].content;
    setQuery(newQuery);
    setQueryEmbedding(generateQueryEmbedding());
    setSelectedDocuments([]);
    setRound(prev => prev + 1);
    setTimer(60);
  };

  const toggleDocumentSelection = (doc) => {
    setSelectedDocuments(prev => 
      prev.includes(doc) ? prev.filter(d => d.id !== doc.id) : [...prev, doc]
    );
  };

  const checkAnswers = useCallback(() => {
    const similarities = documents.map(doc => ({
      ...doc,
      similarity: cosineSimilarity(queryEmbedding, doc.embedding)
    })).sort((a, b) => b.similarity - a.similarity);

    const topSimilar = similarities.slice(0, 3);
    const correctSelections = selectedDocuments.filter(doc => 
      topSimilar.some(similar => similar.id === doc.id)
    );

    setScore(prev => Math.min(prev + correctSelections.length, MAX_SCORE));
    setShowResult(true);
  }, [queryEmbedding, selectedDocuments]);

  useEffect(() => {
    if (gameStarted && round < 5) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 0) {
            clearInterval(interval);
            checkAnswers();
            return 60;
          }
          return prevTimer - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameStarted, round, checkAnswers]);

  const resetGame = () => {
    setGameStarted(false);
    setPlayerName('');
    setScore(0);
    setRound(0);
    setShowResult(false);
  };

  if (!gameStarted) {
    return (
        <div className="p-4 max-w-md mx-auto" style={{ backgroundColor: mongoColors.gray }}>
          <Card>
            <CardHeader style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
              <h1 className="text-2xl font-bold text-center">MongoDB Vector Search Game</h1>
              <p className="text-center">Player: {playerName}</p>
              <p className="text-center">Score: {score}/{MAX_SCORE} | Round: {round}/5</p>
              <p className="text-center">Time remaining: {timer}s</p>
            </CardHeader>
          <CardContent>
            <p className="mb-4" style={{ color: mongoColors.darkBlue }}>
              In this game, you'll simulate MongoDB's vector search functionality. 
              Your task is to select documents that are semantically similar to the given query, 
              based on their vector embeddings.
            </p>
            <div className="mb-4">
              <label htmlFor="playerName" className="block text-sm font-medium mb-2" style={{ color: mongoColors.darkBlue }}>
                Enter your name:
              </label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full p-2 border rounded"
                style={{ borderColor: mongoColors.darkBlue }}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={startGame}
              className="px-4 py-2 rounded"
              style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}
              disabled={playerName.trim() === ''}
            >
              Start Game
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto" style={{ backgroundColor: mongoColors.gray }}>
      <Card>
        <CardHeader style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
          <h1 className="text-2xl font-bold text-center">MongoDB Vector Search Game</h1>
          <p className="text-center">Player: {playerName}</p>
          <p className="text-center">Score: {score}/{MAX_SCORE} | Round: {round}/5</p>
          <p className="text-center">Time remaining: {timer}s</p>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2" style={{ color: mongoColors.darkBlue }}>
              Query: "{query}"
            </h2>
            <p className="text-sm mb-2" style={{ color: mongoColors.darkBlue }}>
              Embedding: [{queryEmbedding.map(n => n.toFixed(2)).join(', ')}]
            </p>
            <p className="text-sm mb-4" style={{ color: mongoColors.darkBlue }}>
              Select the 3 most semantically similar documents:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {documents.map(doc => (
                <Button
                  key={doc.id}
                  onClick={() => toggleDocumentSelection(doc)}
                  className={`p-2 rounded text-left ${selectedDocuments.includes(doc) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  style={selectedDocuments.includes(doc) ? 
                    { backgroundColor: mongoColors.darkBlue, color: 'white' } : 
                    { backgroundColor: mongoColors.lightBlue, color: mongoColors.darkBlue }}
                >
                  <div>{doc.content}</div>
                  <div className="text-xs">Embedding: [{doc.embedding.map(n => n.toFixed(2)).join(', ')}]</div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={checkAnswers} className="px-4 py-2 rounded mr-2" style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
            Submit Answer
          </Button>
          <Button onClick={onReturnToMainMenu} className="px-4 py-2 rounded" style={{ backgroundColor: mongoColors.lightBlue, color: mongoColors.darkBlue }}>
            Main Menu
          </Button>
        </CardFooter>
      </Card>
      
      <AlertDialog open={showResult} onOpenChange={setShowResult}>
        <AlertDialogContent style={{ backgroundColor: 'white', color: mongoColors.darkBlue }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Round Result</AlertDialogTitle>
            <AlertDialogDescription>
              Your current score is {score}/{MAX_SCORE}!
              {round < 5 ? " Get ready for the next round!" : ` Game Over! Your final score is ${score}/${MAX_SCORE}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setShowResult(false);
              if (round < 5) nextRound();
              else resetGame();
            }} style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
              {round < 5 ? "Next Round" : "Play Again"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VectorSearchGame;