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

// Updated document database with 2D vectors
const documents = [
  { id: 1, content: "MongoDB offers scalable NoSQL database solutions.", vector: [0.2, 0.8] },
  { id: 2, content: "Vector search enables semantic similarity in queries.", vector: [0.9, 0.1] },
  { id: 3, content: "Cloud computing provides flexible infrastructure.", vector: [0.3, 0.6] },
  { id: 4, content: "Machine learning algorithms improve data analysis.", vector: [0.7, 0.2] },
  { id: 5, content: "Data security is crucial for business operations.", vector: [0.5, 0.5] },
  { id: 6, content: "Agile methodology enhances software development.", vector: [0.1, 0.9] },
  { id: 7, content: "Blockchain technology ensures data integrity.", vector: [0.6, 0.4] },
  { id: 8, content: "APIs facilitate seamless system integration.", vector: [0.4, 0.7] },
];

// Function to calculate Euclidean distance (for 2D vectors)
const euclideanDistance = (A, B) => {
  return Math.sqrt(Math.pow(A[0] - B[0], 2) + Math.pow(A[1] - B[1], 2));
};

const VectorSearchGame = ({ onReturnToMainMenu }) => {
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [queryDocument, setQueryDocument] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timer, setTimer] = useState(60);
  const MAX_SCORE = 15;

  const renderVectorVisual = (doc, isQuery = false, selected) => {
    if (!doc || !doc.vector) {
      return null;
    }
    return (
      <VectorVisual 
        vector={doc.vector} 
        isQuery={isQuery}
        isSelected={selected}
      />
    );
  };

  const VectorVisual = ({ vector, isQuery, isSelected }) => {
    const size = 100; // Size of the visual square
    const dotSize = 6; // Size of the dot representing the vector
    if (!vector || !Array.isArray(vector) || vector.length !== 2 || vector.some(v => typeof v !== 'number')) {
      return (
        <div className="flex flex-col items-center">
          <div style={{ 
            width: size, 
            height: size, 
            border: `2px solid ${mongoColors.darkBlue}`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isSelected ? mongoColors.lightBlue : 'white',
          }}>
            Invalid Vector
          </div>
        </div>
      );
    }
    const dotColor = isQuery ? mongoColors.green : mongoColors.darkBlue;

    return (
      <div className="flex flex-col items-center">
        <div style={{ 
          width: size, 
          height: size, 
          border: `2px solid ${mongoColors.darkBlue}`,
          position: 'relative',
          backgroundColor: isSelected ? mongoColors.lightBlue : 'white',
          marginBottom: '8px'
        }}>
          <div style={{
            position: 'absolute',
            left: vector[0] * size - (dotSize / 2),
            bottom: vector[1] * size - (dotSize / 2),
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            backgroundColor: dotColor
          }} />
        </div>
        <div style={{ color: mongoColors.darkBlue, fontSize: '0.8rem' }}>
          [{vector[0].toFixed(2)}, {vector[1].toFixed(2)}]
        </div>
      </div>
    );
  };

  const startGame = () => {
    setGameStarted(true);
    nextRound();
  };

  const nextRound = () => {
    const newQuery = documents[Math.floor(Math.random() * documents.length)];
    setQueryDocument(newQuery);
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
    const distances = documents
      .filter(doc => doc.id !== queryDocument.id)
      .map(doc => ({
        ...doc,
        distance: euclideanDistance(queryDocument.vector, doc.vector)
      }))
      .sort((a, b) => a.distance - b.distance);

    const topSimilar = distances.slice(0, 3);
    const correctSelections = selectedDocuments.filter(doc => 
      topSimilar.some(similar => similar.id === doc.id)
    );

    setScore(prev => Math.min(prev + correctSelections.length, MAX_SCORE));
    setShowResult(true);
  }, [queryDocument, selectedDocuments]);

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
                  <h1 className="text-2xl font-bold text-center">MongoDB 3D Vector Search Game</h1>
                  {gameStarted && (
                    <>
                      <p className="text-center">Player: {playerName}</p>
                      <p className="text-center">Score: {score}/{MAX_SCORE} | Round: {round}/5</p>
                      <p className="text-center">Time remaining: {timer}s</p>
                    </>
                  )}
                </CardHeader>
                <CardContent>
                  {!gameStarted ? (
                    <>
                      <p className="text-center mb-4" style={{ color: mongoColors.darkBlue }}>
                        Welcome to the Vector Search Game! Enter your name and click the button below to start.
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
                    queryDocument && (
                      <div className="mb-4">
                        <h2 className="text-lg font-semibold mb-2" style={{ color: mongoColors.darkBlue }}>
                          Query: "{queryDocument.content}"
                        </h2>
                        <div className="flex justify-center mb-4">
                          {renderVectorVisual(queryDocument, true, false)}
                        </div>
                        <p className="text-sm mb-4" style={{ color: mongoColors.darkBlue }}>
                          Select the 3 documents with the most similar vector representations:
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          {documents.filter(doc => doc.id !== queryDocument.id).map(doc => (
                            <div key={doc.id} className="flex flex-col items-center">
                              {renderVectorVisual(doc, false, selectedDocuments.includes(doc))}
                              <Button
                                onClick={() => toggleDocumentSelection(doc)}
                                className={`mt-2 p-2 rounded text-left text-xs ${selectedDocuments.includes(doc) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                style={selectedDocuments.includes(doc) ? 
                                  { backgroundColor: mongoColors.darkBlue, color: 'white' } : 
                                  { backgroundColor: mongoColors.lightBlue, color: mongoColors.darkBlue }}
                              >
                                {doc.content}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
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
                    <>
                      <Button onClick={checkAnswers} className="px-4 py-2 rounded mr-2" style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
                        Submit Answer
                      </Button>
                      <Button onClick={onReturnToMainMenu} className="px-4 py-2 rounded" style={{ backgroundColor: mongoColors.lightBlue, color: mongoColors.darkBlue }}>
                        Main Menu
                      </Button>
                    </>
                  )}
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
              {gameStarted && (
                <>
                  <p className="text-center">Player: {playerName}</p>
                  <p className="text-center">Score: {score}/{MAX_SCORE} | Round: {round}/5</p>
                  <p className="text-center">Time remaining: {timer}s</p>
                </>
              )}
            </CardHeader>
            <CardContent>
              {!gameStarted ? (
                <>
                  <p className="text-center mb-4" style={{ color: mongoColors.darkBlue }}>
                    Welcome to the Vector Search Game! Enter your name and click the button below to start.
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
                queryDocument && (
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-2" style={{ color: mongoColors.darkBlue }}>
                      Query: "{queryDocument.content}"
                    </h2>
                    <div className="flex justify-center mb-4">
                      {renderVectorVisual(queryDocument, true, false)}
                    </div>
                    <p className="text-sm mb-4" style={{ color: mongoColors.darkBlue }}>
                      Select the 3 documents with the most similar vector representations:
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {documents.filter(doc => doc.id !== queryDocument.id).map(doc => (
                        <div key={doc.id} className="flex flex-col items-center">
                          {renderVectorVisual(doc, false, selectedDocuments.includes(doc))}
                          <Button
                            onClick={() => toggleDocumentSelection(doc)}
                            className={`mt-2 p-2 rounded text-left text-xs ${selectedDocuments.includes(doc) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            style={selectedDocuments.includes(doc) ? 
                              { backgroundColor: mongoColors.darkBlue, color: 'white' } : 
                              { backgroundColor: mongoColors.lightBlue, color: mongoColors.darkBlue }}
                          >
                            {doc.content}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
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
                <>
                  <Button onClick={checkAnswers} className="px-4 py-2 rounded mr-2" style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
                    Submit Answer
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