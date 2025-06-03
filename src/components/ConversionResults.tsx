import React from 'react';
import { Download, Cpu, Globe, Clock, CheckCircle } from 'lucide-react';
import { ConversionResult } from '../utils/types';

interface ConversionResultsProps {
  results: ConversionResult;
  onExport: () => void;
}

const ConversionResults: React.FC<ConversionResultsProps> = ({ results, onExport }) => {
  const isApiConversion = results.conversionMethod === 'api';
  
  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold text-gray-800">DATA CONVERSION</h2>
          <div className="flex items-center space-x-2">
            {isApiConversion ? (
              <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                <Globe className="h-3 w-3" />
                <span>API</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                <Cpu className="h-3 w-3" />
                <span>Local</span>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={onExport}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
        >
          <Download className="h-4 w-4 mr-2" />
          Extract Data
        </button>
      </div>

      {/* Metadata Section */}
      {results.metadata && (
        <div className="bg-gray-50 rounded-md p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Conversion Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Method:</span>
              <span className="ml-2 font-medium">
                {isApiConversion ? 'API (ISO 14912:2023)' : 'Local Calculation'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Standard:</span>
              <span className="ml-2 font-medium">{results.metadata.standard}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 text-gray-400 mr-1" />
              <span className="text-gray-500">Time:</span>
              <span className="ml-2 font-medium">
                {new Date(results.metadata.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-md shadow-sm border border-blue-100">
          <p className="text-sm text-gray-500 mb-1">Reference Temperature</p>
          <p className="text-lg font-medium">{results.referenceConditions.temperature} °C</p>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow-sm border border-blue-100">
          <p className="text-sm text-gray-500 mb-1">Reference Pressure</p>
          <p className="text-lg font-medium">{results.referenceConditions.pressure} bar absolute</p>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow-sm border border-blue-100">
          <p className="text-sm text-gray-500 mb-1">Output Unit</p>
          <p className="text-lg font-medium">{results.outputUnit}</p>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-white rounded-md shadow-sm border border-blue-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Component
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                CAS Number
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Converted Value
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Uncertainty
              </th>
              {results.components.some(comp => comp.originalValue !== undefined) && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Original Value
                </th>
              )}
              {results.components.some(comp => comp.conversionFactor !== undefined) && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Factor
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.components.map((component) => (
              <tr key={component.id} className="hover:bg-blue-50 transition-colors duration-150">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {component.name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {component.cas}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-mono">
                  {component.value.toExponential(4)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-mono">
                  {component.uncertainty.toExponential(4)}
                </td>
                {results.components.some(comp => comp.originalValue !== undefined) && (
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {component.originalValue?.toExponential(4) || '-'}
                  </td>
                )}
                {results.components.some(comp => comp.conversionFactor !== undefined) && (
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {component.conversionFactor?.toFixed(6) || '-'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>* Conversion performed according to {results.metadata?.standard || 'ISO 14912:2023'}</p>
        {isApiConversion && (
          <p>* API conversion ensures compliance with international standards</p>
        )}
        {!isApiConversion && (
          <p>* Local conversion using simplified calculation methods</p>
        )}
      </div>
    </div>
  );
};

export default ConversionResults;