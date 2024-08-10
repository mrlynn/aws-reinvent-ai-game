import React, { useState } from 'react';
import MainMenu from './MainMenu';
import AIWorkflowGame from './AIWorkflowGame';
import VectorSearchGame from './VectorSearchGame';
import TimeSeriesPredictionGame from './TimeSeriesPredictionGame';
import TriggerGame from './TriggerGame';
import AtlasTreasureHunt from './AITreasureHuntGame';
import DrawingGame from './DrawingGame';
import Leaderboard from './Leaderboard';  // Import the new Leaderboard component

const App = () => {
  const [currentGame, setCurrentGame] = useState(null);

  const returnToMainMenu = () => {
    setCurrentGame(null);
  };

  return (
    <div className="App">
      {currentGame === null && (
        <MainMenu 
          onStartAIWorkflowGame={() => setCurrentGame('aiWorkflow')}
          onStartVectorSearchGame={() => setCurrentGame('vectorSearch')}
          onStartTimeSeriesPredictionGame={() => setCurrentGame('timeSeries')}
          onStartTriggerGame={() => setCurrentGame('trigger')}
          onStartAtlasTreasureHunt={() => setCurrentGame('atlasTreasureHunt')}
          onStartDrawingGame={() => setCurrentGame('drawingGame')}
          onViewLeaderboard={() => setCurrentGame('leaderboard')}  // Add this line
        />
      )}
      {currentGame === 'aiWorkflow' && <AIWorkflowGame onReturnToMainMenu={returnToMainMenu} />}
      {currentGame === 'vectorSearch' && <VectorSearchGame onReturnToMainMenu={returnToMainMenu} />}
      {currentGame === 'timeSeries' && <TimeSeriesPredictionGame onReturnToMainMenu={returnToMainMenu} />}
      {currentGame === 'trigger' && <TriggerGame onReturnToMainMenu={returnToMainMenu} />}
      {currentGame === 'atlasTreasureHunt' && <AtlasTreasureHunt onReturnToMainMenu={returnToMainMenu} />}
      {currentGame === 'drawingGame' && <DrawingGame onReturnToMainMenu={returnToMainMenu} />}
      {currentGame === 'leaderboard' && <Leaderboard onReturnToMainMenu={returnToMainMenu} />}  // Add this line
    </div>
  );
};

export default App;