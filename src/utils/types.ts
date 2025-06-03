// Type definitions for the gas conversion tool

// Import API types
import type { Molecule } from '../services';
import { QuantityType } from '../services';

// Enhanced GasComponent with API integration
export interface GasComponent {
  id: string;
  name: string;
  cas: string;
  value: number;
  uncertainty: number;
  factor: number;
  // API integration fields
  molecule?: Molecule;
  isValidated?: boolean;
  apiError?: string;
}

export interface OperatingConditions {
  temperature: number; // in Celsius
  pressure: number;    // in bar absolute
  inputUnit: string;
  outputUnit: string;
  // API integration fields
  quantityType?: QuantityType;
  balanceGas?: string;
}

export interface ReferenceConditions {
  temperature: number; // in Celsius
  pressure: number;    // in bar absolute
}

export interface ConversionResult {
  referenceConditions: ReferenceConditions;
  outputUnit: string;
  components: ConvertedComponent[];
  // API integration fields
  apiResult?: any;
  conversionMethod?: 'local' | 'api';
  metadata?: {
    timestamp: string;
    standard: string;
    version: string;
  };
}

export interface ConvertedComponent {
  id: string;
  name: string;
  cas: string;
  value: number;
  uncertainty: number;
  // API integration fields
  originalValue?: number;
  conversionFactor?: number;
}

// New types for enhanced functionality
export interface ValidationMessage {
  type: 'error' | 'warning' | 'info';
  message: string;
  component?: string;
  code?: string;
}

export interface AppState {
  isOnline: boolean;
  apiStatus: 'connected' | 'disconnected' | 'checking';
  lastApiCheck?: Date;
}

export interface ExportData {
  metadata: {
    timestamp: string;
    version: string;
    standard: string;
    exportType: 'local' | 'api';
  };
  operatingConditions: OperatingConditions;
  inputComponents: GasComponent[];
  conversionResults?: ConversionResult;
  validationMessages?: ValidationMessage[];
}

// Supported units mapping
export const SUPPORTED_UNITS = {
  INPUT: [
    'mol/mol : mole fraction',
    'µmol/mol : micro mole fraction',
    'mmol/mol : milli mole fraction',
    'ppm : parts per million',
    'ppb : parts per billion',
    'ppt : parts per trillion'
  ],
  OUTPUT: [
    'mol/mol : mole fraction',
    'µmol/mol : micro mole fraction',
    'mmol/mol : milli mole fraction',
    'm3/m3 : volume fraction',
    'ppm : parts per million',
    'ppb : parts per billion',
    'ppt : parts per trillion',
    'mg/m3 : mass concentration'
  ]
} as const;

// Unit mapping to API QuantityType
export const UNIT_TO_QUANTITY_TYPE: Record<string, QuantityType> = {
  'mol/mol : mole fraction': QuantityType.MOLAR_RATIO,
  'µmol/mol : micro mole fraction': QuantityType.MOLAR_RATIO,
  'mmol/mol : milli mole fraction': QuantityType.MOLAR_RATIO,
  'ppm : parts per million': QuantityType.MOLAR_RATIO,
  'ppb : parts per billion': QuantityType.MOLAR_RATIO,
  'ppt : parts per trillion': QuantityType.MOLAR_RATIO,
  'm3/m3 : volume fraction': QuantityType.VOLUME_RATIO,
  'mg/m3 : mass concentration': QuantityType.MASS_CONCENTRATION
};

// Common gas components with CAS numbers
export const COMMON_GAS_COMPONENTS = {
  'CH4 Methane': { cas: '74-82-8', molarMass: 16.04 },
  'CO2 Carbon Dioxide': { cas: '124-38-9', molarMass: 44.01 },
  'O2 Oxygen': { cas: '7782-44-7', molarMass: 32.00 },
  'N2 Nitrogen': { cas: '7727-37-9', molarMass: 28.01 },
  'Ar Argon': { cas: '7440-37-1', molarMass: 39.95 },
  'He Helium': { cas: '7440-59-7', molarMass: 4.00 },
  'H2 Hydrogen': { cas: '1333-74-0', molarMass: 2.02 },
  'CO Carbon Monoxide': { cas: '630-08-0', molarMass: 28.01 },
  'H2S Hydrogen Sulfide': { cas: '7783-06-4', molarMass: 34.08 },
  'NH3 Ammonia': { cas: '7664-41-7', molarMass: 17.03 }
} as const;

// Validation limits
export const VALIDATION_LIMITS = {
  TEMPERATURE: {
    MIN: -273.15, // Absolute zero
    MAX: 1000     // °C
  },
  PRESSURE: {
    MIN: 0.001,   // bar
    MAX: 1000     // bar
  },
  COMPONENT_VALUE: {
    MIN: 0,
    MAX: 1
  },
  UNCERTAINTY: {
    MIN: 0,
    MAX: 1
  }
} as const;

// Application constants
export const APP_CONFIG = {
  NAME: 'IHM Gas Tool',
  VERSION: '1.0.0',
  DESCRIPTION: 'ISO 14912:2023 Gas Mixture Component Unit Conversion Tool',
  AUTHOR: 'IHM Team',
  STANDARD: 'ISO 14912:2023',
  API_TIMEOUT: 10000,
  DEFAULT_BALANCE_GAS: 'N2'
} as const;