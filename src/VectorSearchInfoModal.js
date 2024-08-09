import React from 'react';
import { Button } from './components/ui/button';

const VectorSearchInfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">How Vector Search Works in This Game</h2>
        <p className="mb-4">
          This game uses MongoDB Atlas Vector Search to compare your drawing guess with the correct answer. Here's how it works:
        </p>
        <ol className="list-decimal list-inside mb-4">
          <li>Your guess is converted into a numerical vector using AI.</li>
          <li>This vector is compared to the vector of the correct answer in the database.</li>
          <li>The similarity between these vectors determines your score.</li>
        </ol>
        <p className="mb-4">
          Vector Search allows for semantic similarity comparisons, meaning it can understand the meaning behind words, not just exact matches.
        </p>
        <p className="mb-4">
          Learn more about MongoDB Atlas Vector Search:
        </p>
        <div className="flex justify-between">
          <Button
            onClick={() => window.open('https://www.mongodb.com/docs/atlas/atlas-search/vector-search/', '_blank')}
            className="mr-2"
            style={{ backgroundColor: '#00ED64', color: '#001E2B' }}
          >
            Learn More
          </Button>
          <Button onClick={onClose} style={{ backgroundColor: '#001E2B', color: 'white' }}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VectorSearchInfoModal;