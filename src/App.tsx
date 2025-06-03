import { useState, useEffect, useCallback } from 'react';
import { Settings, TestTube, Calculator } from 'lucide-react';
import Header from './components/Header';
import ConversionTool from './components/ConversionTool';
import LoginModal from './components/LoginModal';
import Welcome from './components/Welcome';
import ApiTestPanel from './components/ApiTestPanel';

type AppTab = 'converter' | 'api-test';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('converter');

  // Global error handling
  useEffect(() => {
    console.log('🚀 IHM Gas Tool Application Starting...');
    console.log('📊 Environment:', {
      nodeEnv: import.meta.env.MODE || 'development',
apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
      timestamp: new Date().toISOString()
    });

    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🔴 Unhandled Promise Rejection:', {
        reason: event.reason,
        timestamp: new Date().toISOString(),
        stack: event.reason?.stack
      });
      
      // Prevent default browser behavior
      event.preventDefault();
      
      // Show user-friendly error message
      alert(`Unexpected error occurred: ${event.reason?.message || event.reason}`);
    };

    // Global error handler for JavaScript errors
    const handleError = (event: ErrorEvent) => {
      console.error('🔴 Global JavaScript Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        timestamp: new Date().toISOString()
      });
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  const handleLogin = useCallback((username: string, password: string) => {
    console.log('🔐 User login attempt:', { username, timestamp: new Date().toISOString() });
    // In a real app, you would validate credentials here
    setUsername(username);
    setIsLoggedIn(true);
    setShowLoginModal(false);
    setShowWelcome(true);
    console.log('✅ User logged in successfully');
  }, []);

  const handleStartApp = useCallback(() => {
    console.log('🎯 User started main application');
    setShowWelcome(false);
  }, []);

  const handleLogout = useCallback(() => {
    console.log('🚪 User logout');
    setIsLoggedIn(false);
    setUsername('');
    setShowWelcome(false);
    setActiveTab('converter');
  }, []);

  const handleTabChange = useCallback((tab: AppTab) => {
    console.log('📑 Tab changed:', { from: activeTab, to: tab });
    setActiveTab(tab);
  }, [activeTab]);

  const handleLoginModalOpen = useCallback(() => {
    console.log('🔐 Login modal opened');
    setShowLoginModal(true);
  }, []);

  const handleLoginModalClose = useCallback(() => {
    console.log('🔐 Login modal closed');
    setShowLoginModal(false);
  }, []);

  if (!isLoggedIn) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-8">
              <div className="flex items-center justify-center mb-4">
                <TestTube className="h-16 w-16 text-indigo-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                IHM Gas Tool
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                ISO 14912:2023 Gas Mixture Component Unit Conversion Tool
              </p>
              <p className="text-sm text-gray-500">
                Professional gas mixture analysis with API integration
              </p>
            </div>
            <button
            onClick={handleLoginModalOpen}
              className="bg-indigo-600 text-white py-3 px-8 rounded-lg text-lg font-medium hover:bg-indigo-700 transition-colors duration-300 shadow-lg"
            >
              Sign In to Continue
            </button>
            <LoginModal
              isOpen={showLoginModal}
            onClose={handleLoginModalClose}
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
          
          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-sm p-1 inline-flex">
              <button
                onClick={() => handleTabChange('converter')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                  activeTab === 'converter'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Calculator className="h-4 w-4" />
                <span>Gas Converter</span>
              </button>
              <button
                onClick={() => handleTabChange('api-test')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                  activeTab === 'api-test'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>API Testing</span>
              </button>
            </div>
            
            {/* User info and logout */}
            <div className="float-right">
              <div className="bg-white rounded-lg shadow-sm px-4 py-2 inline-flex items-center space-x-3">
                <span className="text-sm text-gray-600">Welcome, {username}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
            <div className="clear-both"></div>
          </div>

        {/* Tab Content */}
        {activeTab === 'converter' && <ConversionTool />}
        {activeTab === 'api-test' && <ApiTestPanel />}
          
          {/* Footer */}
          <div className="mt-12 text-center text-sm text-gray-500">
            <p>IHM Gas Tool v1.0.0 | ISO 14912:2023 Compliant</p>
            <p className="mt-1">Professional gas mixture analysis and unit conversion</p>
          </div>
        </div>
      </div>
  );
}

export default App;