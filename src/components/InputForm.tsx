import React from 'react';
import { OperatingConditions } from '../utils/types';

interface InputFormProps {
  conditions: OperatingConditions;
  onConditionsChange: (conditions: Partial<OperatingConditions>) => void;
}

const InputForm: React.FC<InputFormProps> = ({ conditions, onConditionsChange }) => {
  const availableInputUnits = [
    'mol/mol : mole fraction',
    'µmol/mol : micro mole fraction',
    'mmol/mol : milli mole fraction',
    'ppm : parts per million',
    'ppb : parts per billion',
    'ppt : parts per trillion'
  ];

  const availableOutputUnits = [
    'mol/mol : mole fraction',
    'µmol/mol : micro mole fraction',
    'mmol/mol : milli mole fraction',
    'm3/m3 : volume fraction',
    'ppm : parts per million',
    'ppb : parts per billion',
    'ppt : parts per trillion',
    'mg/m3 : mass concentration'
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
          Temperature (°C)
        </label>
        <input
          type="number"
          id="temperature"
          value={conditions.temperature}
          onChange={(e) => onConditionsChange({ temperature: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          step="0.1"
        />
      </div>
      
      <div>
        <label htmlFor="pressure" className="block text-sm font-medium text-gray-700 mb-1">
          Pressure (bar absolute)
        </label>
        <input
          type="number"
          id="pressure"
          value={conditions.pressure}
          onChange={(e) => onConditionsChange({ pressure: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          step="0.01"
        />
      </div>
      
      <div>
        <label htmlFor="inputUnit" className="block text-sm font-medium text-gray-700 mb-1">
          Input Unit
        </label>
        <select
          id="inputUnit"
          value={conditions.inputUnit}
          onChange={(e) => onConditionsChange({ inputUnit: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {availableInputUnits.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="outputUnit" className="block text-sm font-medium text-gray-700 mb-1">
          Output Unit
        </label>
        <select
          id="outputUnit"
          value={conditions.outputUnit}
          onChange={(e) => onConditionsChange({ outputUnit: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {availableOutputUnits.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default InputForm;