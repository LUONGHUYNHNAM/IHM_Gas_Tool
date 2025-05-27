import React, { useState } from 'react';
import InputForm from './InputForm';
import ComponentTable from './ComponentTable';
import ConversionResults from './ConversionResults';
import { performConversion } from '../utils/conversionLogic';
import { GasComponent, OperatingConditions, ConversionResult } from '../utils/types';

const ConversionTool = () => {
  const [operatingConditions, setOperatingConditions] = useState<OperatingConditions>({
    temperature: 15,
    pressure: 1,
    inputUnit: 'mol/mol : mole fraction',
    outputUnit: 'm3/m3 : volume fraction'
  });

  const [components, setComponents] = useState<GasComponent[]>([
    {
      id: '1',
      name: 'CH4 Methane',
      cas: '74-82-8',
      value: 0.000001,
      uncertainty: 0.0000004,
      factor: 1
    }
  ]);

  const [validationMessages, setValidationMessages] = useState<{
    errors: string[];
    warnings: string[];
  }>({ errors: [], warnings: [] });

  const [conversionResults, setConversionResults] = useState<ConversionResult | null>(null);

  const handleConditionsChange = (newConditions: Partial<OperatingConditions>) => {
    setOperatingConditions({ ...operatingConditions, ...newConditions });
  };

  const handleComponentsChange = (newComponents: GasComponent[]) => {
    setComponents(newComponents);
    
    // Simple validation
    const errors = [];
    const warnings = [];
    
    const totalValue = newComponents.reduce((sum, comp) => sum + comp.value, 0);
    
    if (totalValue > 1) {
      errors.push("Total component values exceed 1.0");
    } else if (totalValue < 0.9999 && totalValue > 0) {
      warnings.push("Total component values are less than 1.0");
    }
    
    if (newComponents.some(comp => comp.value < 0)) {
      errors.push("Component values cannot be negative");
    }
    
    setValidationMessages({ errors, warnings });
  };

  const handleStartConversion = () => {
    if (validationMessages.errors.length > 0) {
      alert("Please fix all errors before conversion");
      return;
    }

    // Perform the conversion
    const results = performConversion(components, operatingConditions);
    setConversionResults(results);
  };

  const handleExportData = () => {
    if (!conversionResults) return;
    
    // Create data for export
    const exportData = {
      operatingConditions,
      inputComponents: components,
      conversionResults
    };
    
    // Create a downloadable JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'gas-conversion-results.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">INPUT DATA</h2>
        <InputForm 
          conditions={operatingConditions}
          onConditionsChange={handleConditionsChange}
        />
        
        <h3 className="text-lg font-medium text-gray-700 mt-6 mb-3">Gas Components</h3>
        <ComponentTable 
          components={components}
          onComponentsChange={handleComponentsChange}
        />
        
        {(validationMessages.errors.length > 0 || validationMessages.warnings.length > 0) && (
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Data Checkup</h3>
            
            {validationMessages.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
                <h4 className="text-red-800 font-medium mb-1">Errors:</h4>
                <ul className="list-disc pl-5">
                  {validationMessages.errors.map((error, index) => (
                    <li key={`error-${index}`} className="text-red-700">{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validationMessages.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <h4 className="text-yellow-800 font-medium mb-1">Warnings:</h4>
                <ul className="list-disc pl-5">
                  {validationMessages.warnings.map((warning, index) => (
                    <li key={`warning-${index}`} className="text-yellow-700">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6">
          <button
            onClick={handleStartConversion}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
          >
            Start Conversion
          </button>
        </div>
      </div>
      
      {conversionResults && (
        <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <ConversionResults 
            results={conversionResults}
            onExport={handleExportData}
          />
        </div>
      )}
    </div>
  );
};

export default ConversionTool;