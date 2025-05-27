import React from 'react';
import { Beaker } from 'lucide-react';

interface WelcomeProps {
  username: string;
  onStartApp: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ username, onStartApp }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-xl shadow-xl max-w-2xl mx-auto">
        <div className="flex items-center justify-center mb-6">
          <Beaker className="h-16 w-16 text-indigo-600" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome, {username}!
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          to the ISO 14912:2023 Gas Mixture Component Unit Conversion Tool
        </p>
        
        <p className="text-gray-600 mb-8">
          This tool helps you convert units of gas mixture components according to ISO 14912:2023 standard.
          Get accurate conversions with proper temperature and pressure considerations.
        </p>
        
        <button
          onClick={onStartApp}
          className="bg-indigo-600 text-white py-3 px-8 rounded-lg text-lg font-medium hover:bg-indigo-700 transition-colors duration-300"
        >
          Start Converting
        </button>
      </div>
    </div>
  );
};

export default Welcome;