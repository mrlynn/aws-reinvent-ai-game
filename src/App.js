import React, { useState } from 'react';
import MainMenu from './MainMenu';
import AIWorkflowGame from './AIWorkflowGame';
import TimeSeriesPredictionGame from './TimeSeriesPredictionGame';
import TriggerGame from './TriggerGame';
import DrawingGame from './DrawingGame';
import Leaderboard from './Leaderboard';  // Import the new Leaderboard component
import DebugEnvironment from './DebugEnvironment';  // Adjust the import path as needed

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
          onStartTimeSeriesPredictionGame={() => setCurrentGame('timeSeries')}
          onStartTriggerGame={() => setCurrentGame('trigger')}
          onStartDrawingGame={() => setCurrentGame('drawingGame')}
          onViewLeaderboard={() => setCurrentGame('leaderboard')} 
        />
      )}
      {currentGame === 'aiWorkflow' && <AIWorkflowGame onReturnToMainMenu={returnToMainMenu} />}
      {currentGame === 'timeSeries' && <TimeSeriesPredictionGame onReturnToMainMenu={returnToMainMenu} />}
      {currentGame === 'trigger' && <TriggerGame onReturnToMainMenu={returnToMainMenu} />}
      {currentGame === 'drawingGame' && <DrawingGame onReturnToMainMenu={returnToMainMenu} />}
      {currentGame === 'leaderboard' && <Leaderboard onReturnToMainMenu={returnToMainMenu} />}
      <DebugEnvironment />
      </div>
  );
};

export default App;