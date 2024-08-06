import React, { useState } from 'react';
import MainMenu from './MainMenu';
import AIWorkflowGame from './AIWorkflowGame';
import VectorSearchGame from './VectorSearchGame';
import TimeSeriesPredictionGame from './TimeSeriesPredictionGame';

const App = () => {
  const [currentGame, setCurrentGame] = useState(null);

  const startAIWorkflowGame = () => {
    setCurrentGame('aiWorkflow');
  };

  const startVectorSearchGame = () => {
    setCurrentGame('vectorGame');
  };
  
  const startTimeSeriesPredictionGame = () => {
    setCurrentGame('timeSeriesPredictionGame');
  };

  const returnToMainMenu = () => {
    setCurrentGame(null);
  };

  return (
    <div className="App">
      {currentGame === null && (
        <MainMenu 
          onStartAIWorkflowGame={startAIWorkflowGame} 
          onStartVectorSearchGame={startVectorSearchGame}
          onStartTimeSeriesPredictionGame={startTimeSeriesPredictionGame}
        />
      )}
      {currentGame === 'aiWorkflow' && (
        <AIWorkflowGame onReturnToMainMenu={returnToMainMenu} />
      )}
      {currentGame === 'vectorGame' && (
        <VectorSearchGame onReturnToMainMenu={returnToMainMenu} />
      )}
      {currentGame === 'timeSeriesPredictionGame' && (
        <TimeSeriesPredictionGame onReturnToMainMenu={returnToMainMenu} />
      )}
    </div>
  );
};

export default App;