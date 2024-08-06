import React from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from './components/ui/card';

const mongoColors = {
  green: '#00ED64',
  darkBlue: '#001E2B',
  lightBlue: '#E3FCF7',
  gray: '#E8EDEB',
};

const MainMenu = ({ onStartAIWorkflowGame, onStartVectorSearchGame, onStartTimeSeriesPredictionGame }) => {
  return (
    <div className="p-4 max-w-md mx-auto" style={{ backgroundColor: mongoColors.gray, minHeight: '100vh' }}>
      <Card style={{ backgroundColor: 'white' }}>
        <CardHeader style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
          <h1 className="text-2xl font-bold text-center">MongoDB/AWS Game Collection</h1>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-4" style={{ color: mongoColors.darkBlue }}>
            Choose a game to play:
          </p>
          <div className="flex flex-col items-center">
            <Button
              onClick={onStartAIWorkflowGame}
              className="px-4 py-2 mb-2 w-full"
              style={{ backgroundColor: mongoColors.darkBlue, color: 'white' }}
            >
              AI Workflow Game
            </Button>
            {/* Add more game buttons here as they are developed */}
            <Button
              onClick={onStartVectorSearchGame}
              className="px-4 py-2 mb-2 w-full"
              style={{ backgroundColor: mongoColors.darkBlue, color: 'white' }}
            >
              Vector Search Game
            </Button>
            <Button
              onClick={onStartTimeSeriesPredictionGame}
              className="px-4 py-2 mb-2 w-full"
              style={{ backgroundColor: mongoColors.darkBlue, color: 'white' }}
            >
              Time Series Game
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full" style={{ color: mongoColors.darkBlue }}>
            More games coming soon!
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MainMenu;