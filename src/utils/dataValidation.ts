import { GasComponent, OperatingConditions } from './types';

/**
 * Validate operating conditions
 * 
 * @param conditions - Operating conditions to validate
 * @returns Array of error messages, empty if no errors
 */
export function validateOperatingConditions(
  conditions: OperatingConditions
): string[] {
  const errors: string[] = [];
  
  // Temperature validation
  if (conditions.temperature < -273.15) {
    errors.push("Temperature cannot be below absolute zero (-273.15°C)");
  }
  
  if (conditions.temperature > 1000) {
    errors.push("Temperature exceeds the valid range (max 1000°C)");
  }
  
  // Pressure validation
  if (conditions.pressure <= 0) {
    errors.push("Pressure must be positive");
  }
  
  if (conditions.pressure > 1000) {
    errors.push("Pressure exceeds the valid range (max 1000 bar)");
  }
  
  return errors;
}

/**
 * Validate gas components
 * 
 * @param components - Gas components to validate
 * @returns Object containing arrays of errors and warnings
 */
export function validateComponents(
  components: GasComponent[]
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if there are any components
  if (components.length === 0) {
    errors.push("At least one component is required");
    return { errors, warnings };
  }
  
  // Validate individual components
  components.forEach((component, index) => {
    if (!component.name.trim()) {
      errors.push(`Component ${index + 1} is missing a name`);
    }
    
    if (component.value < 0) {
      errors.push(`Component ${component.name || index + 1} has a negative value`);
    }
    
    if (component.uncertainty < 0) {
      errors.push(`Component ${component.name || index + 1} has a negative uncertainty`);
    }
    
    if (component.factor <= 0) {
      errors.push(`Component ${component.name || index + 1} has an invalid factor (must be positive)`);
    }
  });
  
  // Validate the sum of component values
  const totalValue = components.reduce((sum, comp) => sum + comp.value, 0);
  
  if (totalValue > 1.0001) { // Allow a small margin for floating point errors
    errors.push("Sum of component values exceeds 1.0");
  } else if (totalValue < 0.9999 && totalValue > 0) {
    warnings.push("Sum of component values is less than 1.0");
  }
  
  // Check for duplicate components
  const names = components.map(c => c.name.trim()).filter(name => name.length > 0);
  const uniqueNames = new Set(names);
  
  if (names.length !== uniqueNames.size) {
    warnings.push("There are duplicate component names");
  }
  
  return { errors, warnings };
}