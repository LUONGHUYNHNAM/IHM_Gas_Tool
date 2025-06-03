// Export all API services
export { default as apiClient, checkApiHealth, handleApiCall } from './api';
export type { ApiError, ApiResponse } from './api';

export { 
  default as MoleculesApiService
} from './moleculesApi';
export type {
  Molecule,
  MoleculeProperties,
  MoleculeSearchParams,
  MoleculeSearchResult,
  MoleculePropertiesRequest,
  MoleculePropertiesResponse
} from './moleculesApi';

export {
  default as Iso14912ApiService,
  QuantityType
} from './iso14912Api';
export type {
  MixtureComponent,
  Mixture,
  ConversionRequest,
  ConversionResult,
  NormalizationRequest,
  NormalizationResult,
  BalanceRequest,
  BalanceResult,
  ValidationRequest,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  QuantityTypeInfo
} from './iso14912Api';

// Re-import to avoid circular dependency
import MoleculesApiService from './moleculesApi';
import Iso14912ApiService from './iso14912Api';
import { checkApiHealth } from './api';

// Convenience exports for common operations
export const API = {
  molecules: MoleculesApiService,
  iso14912: Iso14912ApiService,
  health: checkApiHealth
}; 