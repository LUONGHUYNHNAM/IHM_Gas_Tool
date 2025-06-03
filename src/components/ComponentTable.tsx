import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { GasComponent } from '../utils/types';
import { MoleculesApiService, Molecule } from '../services';

interface ComponentTableProps {
  components: GasComponent[];
  onComponentsChange: (components: GasComponent[]) => void;
}

const ComponentTable: React.FC<ComponentTableProps> = ({ components, onComponentsChange }) => {
  const [searchSuggestions, setSearchSuggestions] = useState<Record<string, Molecule[]>>({});
  const [isSearching, setIsSearching] = useState<Record<string, boolean>>({});

  const handleAddComponent = () => {
    const newId = (Math.max(0, ...components.map(c => parseInt(c.id))) + 1).toString();
    
    onComponentsChange([
      ...components,
      {
        id: newId,
        name: '',
        cas: '',
        value: 0,
        uncertainty: 0,
        factor: 1,
        isValidated: false
      }
    ]);
  };

  const handleRemoveComponent = (id: string) => {
    if (components.length <= 1) {
      alert("Cannot remove the last component");
      return;
    }
    
    onComponentsChange(components.filter(c => c.id !== id));
  };

  const handleComponentChange = (id: string, field: keyof GasComponent, value: string | number) => {
    onComponentsChange(
      components.map(component =>
        component.id === id ? { ...component, [field]: value, isValidated: false } : component
      )
    );
  };

  // Tìm kiếm phân tử khi người dùng nhập tên
  const handleNameSearch = async (componentId: string, query: string) => {
    if (!query || query.length < 2) {
      setSearchSuggestions(prev => ({ ...prev, [componentId]: [] }));
      return;
    }

    setIsSearching(prev => ({ ...prev, [componentId]: true }));

    try {
      const suggestions = await MoleculesApiService.getSuggestions(query);
      setSearchSuggestions(prev => ({ ...prev, [componentId]: suggestions }));
    } catch (error) {
      console.error('Error searching molecules:', error);
      setSearchSuggestions(prev => ({ ...prev, [componentId]: [] }));
    } finally {
      setIsSearching(prev => ({ ...prev, [componentId]: false }));
    }
  };

  // Chọn phân tử từ gợi ý
  const handleSelectMolecule = (componentId: string, molecule: Molecule) => {
    onComponentsChange(
      components.map(component =>
        component.id === componentId 
          ? { 
              ...component, 
              name: molecule.name,
              cas: molecule.cas_number,
              molecule: molecule,
              isValidated: true,
              apiError: undefined
            } 
          : component
      )
    );
    setSearchSuggestions(prev => ({ ...prev, [componentId]: [] }));
  };

  // Validate CAS number
  const validateCasNumber = async (componentId: string, casNumber: string) => {
    if (!casNumber) return;

    try {
      const molecule = await MoleculesApiService.findByCasNumber(casNumber);
      if (molecule) {
        onComponentsChange(
          components.map(component =>
            component.id === componentId 
              ? { 
                  ...component, 
                  name: molecule.name,
                  molecule: molecule,
                  isValidated: true,
                  apiError: undefined
                } 
              : component
          )
        );
      } else {
        onComponentsChange(
          components.map(component =>
            component.id === componentId 
              ? { 
                  ...component, 
                  isValidated: false,
                  apiError: 'CAS number not found in database'
                } 
              : component
          )
        );
      }
    } catch (error) {
      console.error('Error validating CAS number:', error);
      onComponentsChange(
        components.map(component =>
          component.id === componentId 
            ? { 
                ...component, 
                isValidated: false,
                apiError: 'Error validating CAS number'
              } 
            : component
        )
      );
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              MATRIX
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              CAS
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Value
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Uncertainty
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Factor
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {components.map((component) => (
            <tr key={component.id} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="px-3 py-2 relative">
                <div className="relative">
                  <input
                    type="text"
                    value={component.name}
                    onChange={(e) => {
                      handleComponentChange(component.id, 'name', e.target.value);
                      handleNameSearch(component.id, e.target.value);
                    }}
                    placeholder="e.g. CH4 Methane"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {isSearching[component.id] && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <Search className="h-4 w-4 text-gray-400 animate-spin" />
                    </div>
                  )}
                </div>
                
                {/* Suggestions dropdown */}
                {searchSuggestions[component.id] && searchSuggestions[component.id].length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {searchSuggestions[component.id].map((molecule) => (
                      <div
                        key={molecule.id}
                        onClick={() => handleSelectMolecule(component.id, molecule)}
                        className="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm"
                      >
                        <div className="font-medium">{molecule.name}</div>
                        <div className="text-gray-500 text-xs">CAS: {molecule.cas_number}</div>
                      </div>
                    ))}
                  </div>
                )}
              </td>
              
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={component.cas}
                  onChange={(e) => handleComponentChange(component.id, 'cas', e.target.value)}
                  onBlur={(e) => validateCasNumber(component.id, e.target.value)}
                  placeholder="e.g. 74-82-8"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </td>
              
              <td className="px-3 py-2">
                <input
                  type="number"
                  value={component.value}
                  onChange={(e) => handleComponentChange(component.id, 'value', parseFloat(e.target.value) || 0)}
                  step="0.000001"
                  min="0"
                  max="1"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </td>
              
              <td className="px-3 py-2">
                <input
                  type="number"
                  value={component.uncertainty}
                  onChange={(e) => handleComponentChange(component.id, 'uncertainty', parseFloat(e.target.value) || 0)}
                  step="0.0000001"
                  min="0"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </td>
              
              <td className="px-3 py-2">
                <input
                  type="number"
                  value={component.factor}
                  onChange={(e) => handleComponentChange(component.id, 'factor', parseFloat(e.target.value) || 1)}
                  step="0.1"
                  min="0"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </td>
              
              <td className="px-3 py-2">
                <div className="flex items-center">
                  {component.isValidated ? (
                    <div title="Validated">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  ) : component.apiError ? (
                    <div title={component.apiError}>
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-gray-300" title="Not validated" />
                  )}
                </div>
              </td>
              
              <td className="px-3 py-2">
                <button
                  onClick={() => handleRemoveComponent(component.id)}
                  className="text-red-600 hover:text-red-800 transition-colors duration-150"
                  disabled={components.length <= 1}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="mt-4">
        <button
          onClick={handleAddComponent}
          className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-150"
        >
          <PlusCircle className="h-5 w-5 mr-1" />
          Add New Component
        </button>
      </div>
    </div>
  );
};

export default ComponentTable;