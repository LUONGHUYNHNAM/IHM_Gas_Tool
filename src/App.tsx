import React, { useState } from 'react';
import Header from './components/Header';
import ConversionTool from './components/ConversionTool';
import LoginModal from './components/LoginModal';
import Welcome from './components/Welcome';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);

  const handleLogin = (username: string, password: string) => {
    // In a real app, you would validate credentials here
    setUsername(username);
    setIsLoggedIn(true);
    setShowLoginModal(false);
    setShowWelcome(true);
  };

  const handleStartApp = () => {
    setShowWelcome(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">
            Gas Mixture Unit Converter
          </h1>
          <button
            onClick={() => setShowLoginModal(true)}
            className="bg-indigo-600 text-white py-3 px-8 rounded-lg text-lg font-medium hover:bg-indigo-700 transition-colors duration-300"
          >
            Sign In
          </button>
          <LoginModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            onLogin={handleLogin}
          />
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return <Welcome username={username} onStartApp={handleStartApp} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <Header />
        <ConversionTool />
      </div>
    </div>
  );
}

export default App;