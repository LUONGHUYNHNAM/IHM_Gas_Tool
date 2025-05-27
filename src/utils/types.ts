// Type definitions for the gas conversion tool

export interface GasComponent {
  id: string;
  name: string;
  cas: string;
  value: number;
  uncertainty: number;
  factor: number;
}

export interface OperatingConditions {
  temperature: number; // in Celsius
  pressure: number;    // in bar absolute
  inputUnit: string;
  outputUnit: string;
}

export interface ReferenceConditions {
  temperature: number; // in Celsius
  pressure: number;    // in bar absolute
}

export interface ConversionResult {
  referenceConditions: ReferenceConditions;
  outputUnit: string;
  components: ConvertedComponent[];
}

export interface ConvertedComponent {
  id: string;
  name: string;
  cas: string;
  value: number;
  uncertainty: number;
}