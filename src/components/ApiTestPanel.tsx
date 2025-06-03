import React, { useState } from 'react';
import { Play, Loader, CheckCircle, XCircle } from 'lucide-react';
import { API } from '../services';

interface TestResult {
  endpoint: string;
  status: 'success' | 'error' | 'loading';
  data?: any;
  error?: string;
  duration?: number;
}

const ApiTestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const testEndpoints = [
    {
      name: 'Health Check',
      endpoint: '/health',
      test: () => API.health()
    },
    {
      name: 'Popular Molecules',
      endpoint: '/molecules/popular',
      test: () => API.molecules.getPopularMolecules()
    },
    {
      name: 'Search Molecules (CO2)',
      endpoint: '/molecules/search?q=CO2',
      test: () => API.molecules.searchMolecules({ q: 'CO2', limit: 5 })
    },
    {
      name: 'Molecule Details (N2)',
      endpoint: '/molecules/N2',
      test: () => API.molecules.getMoleculeDetails('N2')
    },
    {
      name: 'Quantity Types',
      endpoint: '/iso14912/quantity-types',
      test: () => API.iso14912.getQuantityTypes()
    }
  ];

  const runTest = async (testItem: typeof testEndpoints[0]) => {
    const startTime = Date.now();
    
    setTestResults(prev => [
      ...prev.filter(r => r.endpoint !== testItem.endpoint),
      { endpoint: testItem.endpoint, status: 'loading' }
    ]);

    try {
      const data = await testItem.test();
      const duration = Date.now() - startTime;
      
      setTestResults(prev => [
        ...prev.filter(r => r.endpoint !== testItem.endpoint),
        { 
          endpoint: testItem.endpoint, 
          status: 'success', 
          data,
          duration
        }
      ]);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      setTestResults(prev => [
        ...prev.filter(r => r.endpoint !== testItem.endpoint),
        { 
          endpoint: testItem.endpoint, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error',
          duration
        }
      ]);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    for (const testItem of testEndpoints) {
      await runTest(testItem);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'loading':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">API Test Panel</h2>
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
        >
          {isRunning ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          <span>{isRunning ? 'Running Tests...' : 'Run All Tests'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {testEndpoints.map((testItem) => {
          const result = testResults.find(r => r.endpoint === testItem.endpoint);
          
          return (
            <div key={testItem.endpoint} className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {result && getStatusIcon(result.status)}
                  <div>
                    <h3 className="font-medium text-gray-900">{testItem.name}</h3>
                    <p className="text-sm text-gray-500">{testItem.endpoint}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {result?.duration && (
                    <span className="text-xs text-gray-500">{result.duration}ms</span>
                  )}
                  <button
                    onClick={() => runTest(testItem)}
                    disabled={result?.status === 'loading'}
                    className="text-sm text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
                  >
                    Test
                  </button>
                </div>
              </div>

              {result && (
                <div className="mt-3">
                  {result.status === 'success' && result.data && (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <p className="text-sm text-green-800 font-medium mb-2">Success</p>
                      <pre className="text-xs text-green-700 overflow-x-auto">
                        {JSON.stringify(result.data, null, 2).substring(0, 500)}
                        {JSON.stringify(result.data, null, 2).length > 500 && '...'}
                      </pre>
                    </div>
                  )}
                  
                  {result.status === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-sm text-red-800 font-medium mb-1">Error</p>
                      <p className="text-sm text-red-700">{result.error}</p>
                    </div>
                  )}
                  
                  {result.status === 'loading' && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-sm text-blue-800">Testing...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-xs text-gray-500">
        <p>* This panel helps test API connectivity and response times</p>
        <p>* Make sure the backend server is running at http://localhost:8000</p>
      </div>
    </div>
  );
};

export default ApiTestPanel; 