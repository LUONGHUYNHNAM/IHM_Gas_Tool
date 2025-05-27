import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { GasComponent } from '../utils/types';

interface ComponentTableProps {
  components: GasComponent[];
  onComponentsChange: (components: GasComponent[]) => void;
}

const ComponentTable: React.FC<ComponentTableProps> = ({ components, onComponentsChange }) => {
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
        factor: 1
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
        component.id === id ? { ...component, [field]: value } : component
      )
    );
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
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {components.map((component) => (
            <tr key={component.id} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={component.name}
                  onChange={(e) => handleComponentChange(component.id, 'name', e.target.value)}
                  placeholder="e.g. CH4 Methane"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={component.cas}
                  onChange={(e) => handleComponentChange(component.id, 'cas', e.target.value)}
                  placeholder="e.g. 74-82-8"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="number"
                  value={component.value}
                  onChange={(e) => handleComponentChange(component.id, 'value', parseFloat(e.target.value))}
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
                  onChange={(e) => handleComponentChange(component.id, 'uncertainty', parseFloat(e.target.value))}
                  step="0.0000001"
                  min="0"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="number"
                  value={component.factor}
                  onChange={(e) => handleComponentChange(component.id, 'factor', parseFloat(e.target.value))}
                  step="0.1"
                  min="0"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </td>
              <td className="px-3 py-2">
                <button
                  onClick={() => handleRemoveComponent(component.id)}
                  className="text-red-600 hover:text-red-800 transition-colors duration-150"
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