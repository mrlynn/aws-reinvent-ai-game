import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from './components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './components/ui/alert-dialog';
import { Input } from './components/ui/input';

const allServices = [
    { id: 'sagemaker', content: 'Amazon SageMaker', description: 'Build, train, and deploy machine learning models' },
    { id: 'comprehend', content: 'Amazon Comprehend', description: 'Discover insights and relationships in text' },
    { id: 'rekognition', content: 'Amazon Rekognition', description: 'Analyze image and video' },
    { id: 'textract', content: 'Amazon Textract', description: 'Extract text and data from documents' },
    { id: 'polly', content: 'Amazon Polly', description: 'Turn text into lifelike speech' },
    { id: 'lex', content: 'Amazon Lex', description: 'Build conversational interfaces' },
    { id: 'translate', content: 'Amazon Translate', description: 'Fluent translation of text' },
    { id: 'transcribe', content: 'Amazon Transcribe', description: 'Automatic speech recognition' },
    { id: 'mongodb-vector-search', content: 'MongoDB Vector Search', description: 'Perform similarity search on vector embeddings' },
  ];
  
// MongoDB color palette
const mongoColors = {
    green: '#00ED64',
    darkBlue: '#001E2B',
    lightBlue: '#E3FCF7',
    gray: '#E8EDEB',
  };

const correctOrder = ['textract', 'comprehend', 'mongodb-vector-search', 'sagemaker', 'polly'];

const AIWorkflowGame = () => {
  const [playerName, setPlayerName] = useState('');
  const [workflowIds, setWorkflowIds] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [availableIds, setAvailableIds] = useState(allServices.map(service => service.id));
  const [isCorrect, setIsCorrect] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [timer, setTimer] = useState(300);
  useEffect(() => {
    let interval;
    if (gameStarted) {
      interval = setInterval(() => {
        setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted]);

  const startGame = () => {
    if (playerName.trim() !== '') {
      setGameStarted(true);
    }
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onDragEnd = useCallback((result) => {
    const { source, destination, draggableId } = result;
  
    if (!destination) {
      return;
    }
  
    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === 'workflow') {
        setWorkflowIds(prev => {
          const newWorkflowIds = Array.from(prev);
          newWorkflowIds.splice(source.index, 1);
          newWorkflowIds.splice(destination.index, 0, draggableId);
          return newWorkflowIds;
        });
      } else {
        setAvailableIds(prev => {
          const newAvailableIds = Array.from(prev);
          newAvailableIds.splice(source.index, 1);
          newAvailableIds.splice(destination.index, 0, draggableId);
          return newAvailableIds;
        });
      }
    } else {
      if (destination.droppableId === 'workflow') {
        setWorkflowIds(prev => {
          const newWorkflowIds = Array.from(prev);
          newWorkflowIds.splice(destination.index, 0, draggableId);
          return newWorkflowIds;
        });
        setAvailableIds(prev => prev.filter(id => id !== draggableId));
      } else {
        setWorkflowIds(prev => prev.filter(id => id !== draggableId));
        setAvailableIds(prev => {
          const newAvailableIds = Array.from(prev);
          newAvailableIds.splice(destination.index, 0, draggableId);
          return newAvailableIds;
        });
      }
    }
  }, []);

  const checkWorkflow = useCallback(() => {
    setIsCorrect(JSON.stringify(workflowIds) === JSON.stringify(correctOrder));
    setShowResult(true);
  }, [workflowIds]);

  const resetGame = useCallback(() => {
    setWorkflowIds([]);
    setAvailableIds(allServices.map(service => service.id));
    setIsCorrect(false);
    setShowResult(false);
    setTimer(300);
  }, []);

  const renderDraggable = useCallback((id, index, isDragging) => {
    const item = allServices.find(service => service.id === id);
    return (
      <Draggable key={id} draggableId={id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`bg-white p-2 mb-2 rounded shadow ${isDragging ? 'opacity-50' : ''}
              ${id === 'mongodb-vector-search' ? 'border-2 border-green-500' : ''}`}
          >
            <div>{item.content}</div>
            <div className="text-sm text-gray-500">{item.description}</div>
          </div>
        )}
      </Draggable>
    );
  }, []);

  if (!gameStarted) {
    return (
      <div className="p-4 max-w-md mx-auto" style={{ backgroundColor: mongoColors.gray }}>
        <Card style={{ backgroundColor: 'white' }}>
          <CardHeader style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
            <h1 className="text-2xl font-bold text-center">MongoDB/AWS - AI Workflow Game</h1>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label htmlFor="playerName" className="block text-sm font-medium mb-2" style={{ color: mongoColors.darkBlue }}>
                Enter your name:
              </label>
              <Input
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
          <h1 className="text-2xl font-bold text-center">AI Workflow Game</h1>
          <p className="text-center">Time remaining: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</p>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Your Workflow</h2>
              <Droppable droppableId="workflow">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="min-h-[100px] bg-gray-100 p-2 rounded"  style={{ backgroundColor: mongoColors.lightBlue }}>
                    {workflowIds.map((id, index) => renderDraggable(id, index, false))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2" style={{ color: mongoColors.darkBlue }}>Available Services</h2>
              <Droppable droppableId="availableServices">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="bg-gray-100 p-2 rounded">
                    {availableIds.map((id, index) => renderDraggable(id, index, workflowIds.includes(id)))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </DragDropContext>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={checkWorkflow} className="bg-blue-500 text-white px-4 py-2 rounded mr-2" style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>
            Submit Workflow
          </Button>
          <Button onClick={resetGame} className="bg-gray-500 text-white px-4 py-2 rounded"style={{ backgroundColor: mongoColors.darkBlue, color: 'white' }}>
            Reset Game
          </Button>
        </CardFooter>
      </Card>
      
      <AlertDialog open={showResult} onOpenChange={setShowResult}>
        <AlertDialogContent style={{ backgroundColor: 'white', color: mongoColors.darkBlue }}>
          <AlertDialogHeader>
            <AlertDialogTitle>{isCorrect ? 'Congratulations!' : 'Not quite right'}</AlertDialogTitle>
            <AlertDialogDescription>
              {isCorrect
                ? "You've successfully created the correct AI workflow!"
                : "The workflow isn't correct. Keep trying! Remember to include MongoDB Vector Search in your workflow."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowResult(false)}style={{ backgroundColor: mongoColors.green, color: mongoColors.darkBlue }}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AIWorkflowGame;