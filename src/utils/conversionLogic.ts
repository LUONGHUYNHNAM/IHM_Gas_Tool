import { 
  GasComponent, 
  OperatingConditions, 
  ConversionResult, 
  ConvertedComponent 
} from './types';

/**
 * Perform unit conversion of gas mixture components according to ISO 14912:2023
 * 
 * @param components - Original gas components with values in the input unit
 * @param conditions - Operating conditions including temperature, pressure, and units
 * @returns Conversion result with components in the output unit
 */
export function performConversion(
  components: GasComponent[],
  conditions: OperatingConditions
): ConversionResult {
  // In a real implementation, this would involve complex calculations
  // based on the ISO 14912:2023 standard formulas.
  // For this example, we'll use a simplified model.
  
  // Set reference conditions
  // Note: According to standard, many conversions use 0°C and 1.01325 bar as reference
  const referenceConditions = {
    temperature: 0,
    pressure: 1.01325
  };
  
  // Conversion factors for different unit types
  // This is a simplified example, in reality these would be calculated
  // based on molecular properties, temperature, pressure, etc.
  const conversionFactors = {
    'mol/mol : mole fraction': {
      'm3/m3 : volume fraction': 0.9994,
      'mg/m3 : mass concentration': calculateMolToMassConversion
    },
    'µmol/mol : micro mole fraction': {
      'm3/m3 : volume fraction': 0.9994 * 1e-6,
      'mg/m3 : mass concentration': (component) => calculateMolToMassConversion(component) * 1e-6
    },
    'ppm : parts per million': {
      'm3/m3 : volume fraction': 0.9994 * 1e-6,
      'mg/m3 : mass concentration': (component) => calculateMolToMassConversion(component) * 1e-6
    }
  };
  
  // Perform the conversion for each component
  const convertedComponents: ConvertedComponent[] = components.map(component => {
    let convertedValue: number;
    let convertedUncertainty: number;
    
    // Get conversion factor based on input and output units
    const inputUnitType = conditions.inputUnit;
    const outputUnitType = conditions.outputUnit;
    
    if (inputUnitType === outputUnitType) {
      // No conversion needed for same units
      convertedValue = component.value;
      convertedUncertainty = component.uncertainty;
    } else if (
      conversionFactors[inputUnitType] && 
      conversionFactors[inputUnitType][outputUnitType]
    ) {
      const factor = conversionFactors[inputUnitType][outputUnitType];
      
      // Apply factor (function or numeric)
      if (typeof factor === 'function') {
        convertedValue = factor(component);
        // Propagate uncertainty (simplified)
        convertedUncertainty = component.uncertainty * (convertedValue / component.value);
      } else {
        convertedValue = component.value * factor;
        convertedUncertainty = component.uncertainty * factor;
      }
    } else {
      // Fallback for unsupported conversion paths
      // In reality, you'd implement the specific conversion formulas from ISO 14912
      convertedValue = component.value * 0.95; // Dummy conversion
      convertedUncertainty = component.uncertainty * 0.95;
    }
    
    // Apply temperature and pressure corrections
    // This is a simplified example
    if (conditions.temperature !== referenceConditions.temperature) {
      const tempCorrectionFactor = (273.15 + referenceConditions.temperature) / 
                                  (273.15 + conditions.temperature);
      convertedValue *= tempCorrectionFactor;
      convertedUncertainty *= tempCorrectionFactor;
    }
    
    if (conditions.pressure !== referenceConditions.pressure) {
      const pressureCorrectionFactor = conditions.pressure / referenceConditions.pressure;
      convertedValue *= pressureCorrectionFactor;
      convertedUncertainty *= pressureCorrectionFactor;
    }
    
    return {
      id: component.id,
      name: component.name,
      cas: component.cas,
      value: convertedValue,
      uncertainty: convertedUncertainty
    };
  });
  
  return {
    referenceConditions,
    outputUnit: conditions.outputUnit,
    components: convertedComponents
  };
}

/**
 * Calculate conversion from mole fraction to mass concentration
 * This is a simplified example. In reality, this would use molar masses
 * from a database and complex equations from ISO 14912.
 * 
 * @param component - Gas component
 * @returns Conversion factor
 */
function calculateMolToMassConversion(component: GasComponent): number {
  // In a real implementation, this would look up the molar mass
  // of the component based on its name or CAS number
  
  // Example molar masses in g/mol
  const molarMasses: Record<string, number> = {
    'CH4 Methane': 16.04,
    'CO2 Carbon Dioxide': 44.01,
    'O2 Oxygen': 32.00,
    'N2 Nitrogen': 28.01,
    'Ar Argon': 39.95,
    'He Helium': 4.00,
    'H2 Hydrogen': 2.02
  };
  
  // Get molar mass or use a default value
  const molarMass = molarMasses[component.name] || 28.96; // Air as default
  
  // Standard molar volume at 0°C and 1.01325 bar (L/mol)
  const standardMolarVolume = 22.414;
  
  // Convert from mol/mol to mg/m³
  // Formula: (mol/mol) * (molar mass in g/mol) * 1000 / (molar volume in L/mol) * 1000
  return component.value * molarMass * 1000 / standardMolarVolume;
}