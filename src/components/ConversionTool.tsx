import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import InputForm from './InputForm';
import ComponentTable from './ComponentTable';
import ConversionResults from './ConversionResults';
import { performConversion } from '../utils/conversionLogic';
import { GasComponent, OperatingConditions, ConversionResult, UNIT_TO_QUANTITY_TYPE, APP_CONFIG } from '../utils/types';
import { Iso14912ApiService, MoleculesApiService, checkApiHealth } from '../services';

const ConversionTool = () => {
  const [operatingConditions, setOperatingConditions] = useState<OperatingConditions>({
    temperature: 15,
    pressure: 1,
    inputUnit: 'mol/mol : mole fraction',
    outputUnit: 'm3/m3 : volume fraction',
    balanceGas: 'N2'
  });

  const [components, setComponents] = useState<GasComponent[]>([
    {
      id: '1',
      name: 'CH4 Methane',
      cas: '74-82-8',
      value: 0.000001,
      uncertainty: 0.0000004,
      factor: 1,
      isValidated: false
    }
  ]);

  const [validationMessages, setValidationMessages] = useState<{
    errors: string[];
    warnings: string[];
  }>({ errors: [], warnings: [] });

  const [conversionResults, setConversionResults] = useState<ConversionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [useApiConversion, setUseApiConversion] = useState(true);
  const [lastApiError, setLastApiError] = useState<string | null>(null);

  // Check API health on component mount và định kỳ
  useEffect(() => {
    console.log('🔄 ConversionTool mounted, initializing API check...');
    checkApiStatus();
    
    // Kiểm tra API status mỗi 30 giây
    const interval = setInterval(() => {
      if (apiStatus !== 'checking') {
        checkApiStatus();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkApiStatus = async () => {
    console.log('🔍 Starting API status check...');
    setApiStatus('checking');
    setLastApiError(null);
    
    try {
      const startTime = Date.now();
      const healthResult = await checkApiHealth();
      const duration = Date.now() - startTime;
      
      console.log(`✅ API Health check successful in ${duration}ms:`, healthResult);
      setApiStatus('connected');
      setLastApiError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ API health check failed:', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      
      setApiStatus('disconnected');
      setLastApiError(errorMessage);
      
      // Tự động tắt API conversion nếu không kết nối được
      if (useApiConversion) {
        console.log('🔄 Auto-disabling API conversion due to connection failure');
        setUseApiConversion(false);
      }
    }
  };

  const handleConditionsChange = (newConditions: Partial<OperatingConditions>) => {
    console.log('🔧 Operating conditions changed:', newConditions);
    setOperatingConditions({ ...operatingConditions, ...newConditions });
  };

  const handleComponentsChange = (newComponents: GasComponent[]) => {
    console.log('🧪 Components changed:', {
      count: newComponents.length,
      components: newComponents.map(c => ({ name: c.name, value: c.value }))
    });
    
    setComponents(newComponents);
    
    // Enhanced validation
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const totalValue = newComponents.reduce((sum, comp) => sum + comp.value, 0);
    
    if (totalValue > 1.001) { // Cho phép sai số nhỏ
      errors.push(`Total component values exceed 1.0 (current: ${totalValue.toFixed(6)})`);
    } else if (totalValue < 0.999 && totalValue > 0) {
      warnings.push(`Total component values are less than 1.0 (current: ${totalValue.toFixed(6)})`);
    }
    
    if (newComponents.some(comp => comp.value < 0)) {
      errors.push("Component values cannot be negative");
    }
    
    if (newComponents.some(comp => comp.value > 1)) {
      errors.push("Individual component values cannot exceed 1.0");
    }
    
    // Check for empty names
    const emptyNameComponents = newComponents.filter(comp => !comp.name.trim());
    if (emptyNameComponents.length > 0) {
      errors.push(`${emptyNameComponents.length} component(s) have empty names`);
    }

    // Check for unvalidated components
    const unvalidatedComponents = newComponents.filter(comp => !comp.isValidated && comp.name.trim());
    if (unvalidatedComponents.length > 0) {
      warnings.push(`${unvalidatedComponents.length} component(s) not validated with API`);
    }
    
    console.log('📊 Validation results:', { errors, warnings });
    setValidationMessages({ errors, warnings });
  };

  const handleStartConversion = async () => {
    console.log('🚀 Starting conversion process...');
    console.log('📊 Current state:', {
      useApiConversion,
      apiStatus,
      validationErrors: validationMessages.errors.length,
      components: components.length,
      operatingConditions,
      timestamp: new Date().toISOString()
    });

    if (validationMessages.errors.length > 0) {
      console.log('❌ Validation errors found, stopping conversion:', validationMessages.errors);
      alert("Please fix all errors before conversion:\n" + validationMessages.errors.join('\n'));
      return;
    }

    setIsLoading(true);
    let results: ConversionResult | null = null;
    const startTime = Date.now();

    try {
      if (useApiConversion && apiStatus === 'connected') {
        console.log('🌐 Attempting API conversion...');
        results = await performApiConversion();
        console.log('✅ API conversion successful');
      } else {
        console.log('💻 Using local conversion...');
        console.log('Reason:', useApiConversion ? 'API not connected' : 'API conversion disabled');
        results = performLocalConversion();
        console.log('✅ Local conversion successful');
      }
      
      const duration = Date.now() - startTime;
      console.log(`⏱️ Conversion completed in ${duration}ms`);
      
      setConversionResults(results);
      setLastApiError(null);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`❌ Conversion failed after ${duration}ms:`, {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      
      setLastApiError(errorMessage);
      
      // Enhanced error message
      const userMessage = `Conversion failed: ${errorMessage}\n\nDetails:\n- Duration: ${duration}ms\n- Method: ${useApiConversion ? 'API' : 'Local'}`;
      alert(userMessage);
      
      // Fallback to local conversion if API fails
      if (useApiConversion && apiStatus === 'connected') {
        try {
          console.log('🔄 Attempting fallback to local conversion...');
          results = performLocalConversion();
          setConversionResults(results);
          alert('API conversion failed, successfully used local conversion instead');
        } catch (localError) {
          const localErrorMessage = localError instanceof Error ? localError.message : 'Unknown local error';
          console.error('❌ Local conversion also failed:', localErrorMessage);
          alert(`Both API and local conversion failed:\nAPI: ${errorMessage}\nLocal: ${localErrorMessage}`);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const performApiConversion = async (): Promise<ConversionResult> => {
    console.log('🔧 Preparing API conversion...');
    
    // Validate unit mapping
    const inputQuantityType = UNIT_TO_QUANTITY_TYPE[operatingConditions.inputUnit];
    const outputQuantityType = UNIT_TO_QUANTITY_TYPE[operatingConditions.outputUnit];

    console.log('📋 Unit mapping check:', {
      inputUnit: operatingConditions.inputUnit,
      outputUnit: operatingConditions.outputUnit,
      inputQuantityType,
      outputQuantityType,
      mappingExists: !!inputQuantityType && !!outputQuantityType
    });

    if (!inputQuantityType || !outputQuantityType) {
      throw new Error(`Unsupported unit type for API conversion:\nInput: ${operatingConditions.inputUnit} -> ${inputQuantityType}\nOutput: ${operatingConditions.outputUnit} -> ${outputQuantityType}`);
    }

    // Create mixture object
    const mixtureComponents = components.map(comp => ({
      molecule_id: comp.cas || comp.name,
      value: comp.value,
      uncertainty: comp.uncertainty
    }));

    const mixture = Iso14912ApiService.createMixture(
      mixtureComponents,
      {
        temperature: operatingConditions.temperature,
        pressure: operatingConditions.pressure
      },
      operatingConditions.balanceGas || APP_CONFIG.DEFAULT_BALANCE_GAS,
      inputQuantityType
    );

    console.log('🧪 Created mixture object:', {
      components: mixtureComponents.length,
      temperature: mixture.temperature,
      pressure: mixture.pressure,
      balanceGas: mixture.balance_gas,
      quantityType: mixture.quantity_type
    });

    // Validate mixture first
    console.log('🔍 Validating mixture with API...');
    const validationResult = await Iso14912ApiService.validateMixture({ 
      mixture,
      target_quantity_type: outputQuantityType 
    });

    console.log('📊 API Validation result:', validationResult);

    if (!validationResult.is_valid) {
      const errorMessages = validationResult.errors.map(err => err.message).join(', ');
      throw new Error(`Mixture validation failed:\n${errorMessages}`);
    }

    // Perform conversion
    console.log('🔄 Performing API conversion...');
    const conversionResult = await Iso14912ApiService.convertUnits({
      mixture,
      target_quantity_type: outputQuantityType
    });

    console.log('✅ API Conversion result received:', {
      componentsCount: conversionResult.converted_mixture.components.length,
      referenceConditions: conversionResult.reference_conditions,
      metadata: conversionResult.metadata
    });

    // Transform API result to local format
    const transformedResult: ConversionResult = {
      referenceConditions: {
        temperature: Iso14912ApiService.kelvinToCelsius(conversionResult.reference_conditions.temperature),
        pressure: Iso14912ApiService.pascalToBar(conversionResult.reference_conditions.pressure)
      },
      outputUnit: operatingConditions.outputUnit,
      components: conversionResult.converted_mixture.components.map((comp, index) => ({
        id: components[index]?.id || index.toString(),
        name: components[index]?.name || comp.molecule_id,
        cas: components[index]?.cas || comp.molecule_id,
        value: comp.value,
        uncertainty: comp.uncertainty,
        originalValue: components[index]?.value,
        conversionFactor: comp.value / (components[index]?.value || 1)
      })),
      apiResult: conversionResult,
      conversionMethod: 'api',
      metadata: {
        timestamp: new Date().toISOString(),
        standard: conversionResult.metadata.standard,
        version: APP_CONFIG.VERSION
      }
    };

    console.log('🎯 Transformed result ready');
    return transformedResult;
  };

  const performLocalConversion = (): ConversionResult => {
    console.log('💻 Performing local conversion...');
    const results = performConversion(components, operatingConditions);
    const enhancedResults: ConversionResult = {
      ...results,
      conversionMethod: 'local',
      metadata: {
        timestamp: new Date().toISOString(),
        standard: APP_CONFIG.STANDARD,
        version: APP_CONFIG.VERSION
      }
    };
    console.log('✅ Local conversion completed');
    return enhancedResults;
  };

  const handleExportData = () => {
    if (!conversionResults) {
      console.log('❌ No conversion results to export');
      return;
    }
    
    console.log('📤 Exporting conversion data...');
    
    // Create comprehensive export data
    const exportData = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: APP_CONFIG.VERSION,
        standard: APP_CONFIG.STANDARD,
        exportType: conversionResults.conversionMethod || 'local',
        apiStatus: apiStatus,
        lastApiError: lastApiError
      },
      operatingConditions,
      inputComponents: components,
      conversionResults,
      validationMessages
    };
    
    // Create a downloadable JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `gas-conversion-results-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    console.log('✅ Export completed:', exportFileDefaultName);
  };

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden">
      {/* Enhanced API Status Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {apiStatus === 'connected' ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : apiStatus === 'disconnected' ? (
                <WifiOff className="h-5 w-5 text-red-500" />
              ) : (
                <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
              )}
              <span className="text-sm font-medium text-gray-700">
                API Status: {apiStatus === 'connected' ? 'Connected' : apiStatus === 'disconnected' ? 'Disconnected' : 'Checking...'}
              </span>
              {lastApiError && (
                <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded" title={lastApiError}>
                  Error: {lastApiError.substring(0, 30)}...
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useApiConversion"
                checked={useApiConversion}
                onChange={(e) => {
                  console.log('🔄 API conversion toggle changed:', e.target.checked);
                  setUseApiConversion(e.target.checked);
                }}
                disabled={apiStatus !== 'connected'}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="useApiConversion" className="text-sm text-gray-700">
                Use API Conversion
              </label>
            </div>
          </div>
          
          <button
            onClick={() => {
              console.log('🔄 Manual API status refresh triggered');
              checkApiStatus();
            }}
            disabled={apiStatus === 'checking'}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:text-gray-400 flex items-center space-x-1"
          >
            <RefreshCw className={`h-4 w-4 ${apiStatus === 'checking' ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

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
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <h4 className="text-red-800 font-medium">Errors ({validationMessages.errors.length}):</h4>
                </div>
                <ul className="list-disc pl-5">
                  {validationMessages.errors.map((error, index) => (
                    <li key={`error-${index}`} className="text-red-700">{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validationMessages.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                  <h4 className="text-yellow-800 font-medium">Warnings ({validationMessages.warnings.length}):</h4>
                </div>
                <ul className="list-disc pl-5">
                  {validationMessages.warnings.map((warning, index) => (
                    <li key={`warning-${index}`} className="text-yellow-700">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 flex items-center space-x-4">
          <button
            onClick={() => {
              console.log('🎯 Convert button clicked');
              handleStartConversion();
            }}
            disabled={isLoading || validationMessages.errors.length > 0}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Converting...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Start Conversion</span>
              </>
            )}
          </button>
          
          {conversionResults && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Converted using: <strong>{conversionResults.conversionMethod === 'api' ? 'API' : 'Local'}</strong> method
              </span>
              {conversionResults.conversionMethod === 'api' && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  ISO 14912:2023
                </span>
              )}
            </div>
          )}
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