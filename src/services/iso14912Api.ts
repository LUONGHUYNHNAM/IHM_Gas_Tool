import apiClient, { handleApiCall } from './api';

// Interfaces cho ISO 14912 API
export interface MixtureComponent {
  molecule_id: string;
  value: number;
  uncertainty: number;
}

export interface Mixture {
  components: MixtureComponent[];
  balance_gas: string;
  quantity_type: QuantityType;
  pressure: number;    // Pascal
  temperature: number; // Kelvin
}

export interface ConversionRequest {
  mixture: Mixture;
  target_quantity_type: QuantityType;
}

export interface ConversionResult {
  original_mixture: Mixture;
  converted_mixture: Mixture;
  conversion_factor: number;
  reference_conditions: {
    temperature: number;
    pressure: number;
  };
  metadata: {
    standard: string;
    timestamp: string;
    conversion_method: string;
  };
}

export interface NormalizationRequest {
  mixture: Mixture;
}

export interface NormalizationResult {
  original_mixture: Mixture;
  normalized_mixture: Mixture;
  normalization_factor: number;
  total_before: number;
  total_after: number;
}

export interface BalanceRequest {
  mixture: Mixture;
  balance_gas_id: string;
}

export interface BalanceResult {
  original_mixture: Mixture;
  balanced_mixture: Mixture;
  balance_gas_amount: number;
  total_components: number;
}

export interface ValidationRequest {
  mixture: Mixture;
  target_quantity_type?: QuantityType;
}

export interface ValidationResult {
  is_valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
  mixture_summary: {
    total_components: number;
    total_value: number;
    balance_gas_fraction: number;
  };
}

export interface ValidationError {
  code: string;
  message: string;
  component?: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  code: string;
  message: string;
  component?: string;
  recommendation?: string;
}

// Enum cho các loại đơn vị
export enum QuantityType {
  MOLAR_RATIO = 'molar_ratio',
  MASS_RATIO = 'mass_ratio',
  VOLUME_RATIO = 'volume_ratio',
  MOLAR_CONCENTRATION = 'molar_concentration',
  MASS_CONCENTRATION = 'mass_concentration',
  VOLUME_CONCENTRATION = 'volume_concentration'
}

export interface QuantityTypeInfo {
  id: QuantityType;
  name: string;
  symbol: string;
  unit: string;
  description: string;
  examples: string[];
}

/**
 * ISO 14912 API Service Class
 */
export class Iso14912ApiService {

  /**
   * Lấy danh sách các loại đơn vị được hỗ trợ
   * @returns Danh sách 6 loại đơn vị
   */
  static async getQuantityTypes(): Promise<QuantityTypeInfo[]> {
    return handleApiCall(() => 
      apiClient.get('/iso14912/quantity-types')
    );
  }

  /**
   * Chuyển đổi đơn vị hỗn hợp khí
   * @param request - Thông tin hỗn hợp và đơn vị đích
   * @returns Kết quả chuyển đổi
   */
  static async convertUnits(request: ConversionRequest): Promise<ConversionResult> {
    return handleApiCall(() => 
      apiClient.post('/iso14912/convert', request)
    );
  }

  /**
   * Chuẩn hóa hỗn hợp khí (tổng = 1.0)
   * @param request - Thông tin hỗn hợp cần chuẩn hóa
   * @returns Kết quả chuẩn hóa
   */
  static async normalizeMixture(request: NormalizationRequest): Promise<NormalizationResult> {
    return handleApiCall(() => 
      apiClient.post('/iso14912/normalize', request)
    );
  }

  /**
   * Cân bằng hỗn hợp với khí cân bằng
   * @param request - Thông tin hỗn hợp và khí cân bằng
   * @returns Kết quả cân bằng
   */
  static async balanceMixture(request: BalanceRequest): Promise<BalanceResult> {
    return handleApiCall(() => 
      apiClient.post('/iso14912/balance', request)
    );
  }

  /**
   * Kiểm tra tính hợp lệ của hỗn hợp
   * @param request - Thông tin hỗn hợp cần kiểm tra
   * @returns Kết quả validation
   */
  static async validateMixture(request: ValidationRequest): Promise<ValidationResult> {
    return handleApiCall(() => 
      apiClient.post('/iso14912/validate', request)
    );
  }

  /**
   * Helper: Chuyển đổi từ mol/mol sang đơn vị khác
   * @param mixture - Hỗn hợp ở dạng mol/mol
   * @param targetType - Loại đơn vị đích
   * @returns Kết quả chuyển đổi
   */
  static async convertFromMolarRatio(
    mixture: Mixture, 
    targetType: QuantityType
  ): Promise<ConversionResult> {
    const request: ConversionRequest = {
      mixture: { ...mixture, quantity_type: QuantityType.MOLAR_RATIO },
      target_quantity_type: targetType
    };
    
    return this.convertUnits(request);
  }

  /**
   * Helper: Chuyển đổi sang mol/mol từ đơn vị khác
   * @param mixture - Hỗn hợp ở đơn vị bất kỳ
   * @returns Kết quả chuyển đổi sang mol/mol
   */
  static async convertToMolarRatio(mixture: Mixture): Promise<ConversionResult> {
    const request: ConversionRequest = {
      mixture,
      target_quantity_type: QuantityType.MOLAR_RATIO
    };
    
    return this.convertUnits(request);
  }

  /**
   * Helper: Chuyển đổi nhiệt độ từ Celsius sang Kelvin
   * @param celsius - Nhiệt độ Celsius
   * @returns Nhiệt độ Kelvin
   */
  static celsiusToKelvin(celsius: number): number {
    return celsius + 273.15;
  }

  /**
   * Helper: Chuyển đổi nhiệt độ từ Kelvin sang Celsius
   * @param kelvin - Nhiệt độ Kelvin
   * @returns Nhiệt độ Celsius
   */
  static kelvinToCelsius(kelvin: number): number {
    return kelvin - 273.15;
  }

  /**
   * Helper: Chuyển đổi áp suất từ bar sang Pascal
   * @param bar - Áp suất bar
   * @returns Áp suất Pascal
   */
  static barToPascal(bar: number): number {
    return bar * 100000;
  }

  /**
   * Helper: Chuyển đổi áp suất từ Pascal sang bar
   * @param pascal - Áp suất Pascal
   * @returns Áp suất bar
   */
  static pascalToBar(pascal: number): number {
    return pascal / 100000;
  }

  /**
   * Helper: Tạo mixture object từ dữ liệu frontend
   * @param components - Danh sách thành phần
   * @param conditions - Điều kiện vận hành
   * @param balanceGas - Khí cân bằng
   * @param quantityType - Loại đơn vị
   * @returns Mixture object
   */
  static createMixture(
    components: Array<{ molecule_id: string; value: number; uncertainty: number }>,
    conditions: { temperature: number; pressure: number }, // Celsius, bar
    balanceGas: string = 'N2',
    quantityType: QuantityType = QuantityType.MOLAR_RATIO
  ): Mixture {
    return {
      components: components.map(comp => ({
        molecule_id: comp.molecule_id,
        value: comp.value,
        uncertainty: comp.uncertainty
      })),
      balance_gas: balanceGas,
      quantity_type: quantityType,
      temperature: this.celsiusToKelvin(conditions.temperature),
      pressure: this.barToPascal(conditions.pressure)
    };
  }

  /**
   * Helper: Kiểm tra nhanh tính hợp lệ của mixture
   * @param mixture - Hỗn hợp cần kiểm tra
   * @returns true nếu hợp lệ
   */
  static async isValidMixture(mixture: Mixture): Promise<boolean> {
    try {
      const result = await this.validateMixture({ mixture });
      return result.is_valid && result.errors.length === 0;
    } catch (error) {
      console.error('Error validating mixture:', error);
      return false;
    }
  }

  /**
   * Helper: Lấy tổng giá trị các thành phần
   * @param components - Danh sách thành phần
   * @returns Tổng giá trị
   */
  static getTotalComponentValue(components: MixtureComponent[]): number {
    return components.reduce((sum, comp) => sum + comp.value, 0);
  }

  /**
   * Helper: Kiểm tra xem có cần chuẩn hóa không
   * @param components - Danh sách thành phần
   * @param tolerance - Dung sai (mặc định 0.001)
   * @returns true nếu cần chuẩn hóa
   */
  static needsNormalization(components: MixtureComponent[], tolerance: number = 0.001): boolean {
    const total = this.getTotalComponentValue(components);
    return Math.abs(total - 1.0) > tolerance;
  }
}

// Export default instance
export default Iso14912ApiService; 