import React from 'react';
import { Download } from 'lucide-react';
import { ConversionResult } from '../utils/types';

interface ConversionResultsProps {
  results: ConversionResult;
  onExport: () => void;
}

const ConversionResults: React.FC<ConversionResultsProps> = ({ results, onExport }) => {
  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">DATA CONVERSION</h2>
        <button
          onClick={onExport}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
        >
          <Download className="h-4 w-4 mr-2" />
          Extract Data
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-md shadow-sm border border-blue-100">
          <p className="text-sm text-gray-500 mb-1">Temperature</p>
          <p className="text-lg font-medium">{results.referenceConditions.temperature} °C</p>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow-sm border border-blue-100">
          <p className="text-sm text-gray-500 mb-1">Pressure</p>
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
                Value
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Uncertainty
              </th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>* Conversion performed according to ISO 14912:2023</p>
      </div>
    </div>
  );
};

export default ConversionResults;