import apiClient, { handleApiCall } from './api';

// Interfaces cho Molecules API
export interface Molecule {
  id: string;
  name: string;
  formula: string;
  cas_number: string;
  molar_mass: number;
  description?: string;
  synonyms?: string[];
  properties?: MoleculeProperties;
}

export interface MoleculeProperties {
  boiling_point?: number;
  melting_point?: number;
  density?: number;
  vapor_pressure?: number;
  critical_temperature?: number;
  critical_pressure?: number;
  acentric_factor?: number;
}

export interface MoleculeSearchParams {
  q: string;
  limit?: number;
}

export interface MoleculeSearchResult {
  molecules: Molecule[];
  total: number;
  query: string;
  limit: number;
}

export interface MoleculePropertiesRequest {
  molecule_id: string;
  temperature: number; // Kelvin
  pressure: number;    // Pascal
}

export interface MoleculePropertiesResponse {
  molecule_id: string;
  temperature: number;
  pressure: number;
  properties: {
    density?: number;
    viscosity?: number;
    thermal_conductivity?: number;
    heat_capacity?: number;
    compressibility_factor?: number;
  };
}

/**
 * Molecules API Service Class
 */
export class MoleculesApiService {
  
  /**
   * Tìm kiếm phân tử bằng CAS number, tên hoặc công thức
   * @param params - Tham số tìm kiếm
   * @returns Kết quả tìm kiếm phân tử
   */
  static async searchMolecules(params: MoleculeSearchParams): Promise<MoleculeSearchResult> {
    const { q, limit = 10 } = params;
    
    return handleApiCall(() => 
      apiClient.get('/molecules/search', {
        params: { q, limit }
      })
    );
  }

  /**
   * Lấy danh sách các phân tử thường dùng
   * @returns Danh sách phân tử phổ biến
   */
  static async getPopularMolecules(): Promise<Molecule[]> {
    return handleApiCall(() => 
      apiClient.get('/molecules/popular')
    );
  }

  /**
   * Lấy thông tin chi tiết của một phân tử
   * @param moleculeId - ID hoặc CAS number của phân tử
   * @returns Thông tin chi tiết phân tử
   */
  static async getMoleculeDetails(moleculeId: string): Promise<Molecule> {
    return handleApiCall(() => 
      apiClient.get(`/molecules/${encodeURIComponent(moleculeId)}`)
    );
  }

  /**
   * Tính toán tính chất phân tử tại điều kiện cụ thể
   * @param request - Thông tin phân tử và điều kiện
   * @returns Tính chất phân tử tại điều kiện đã cho
   */
  static async calculateMoleculeProperties(
    request: MoleculePropertiesRequest
  ): Promise<MoleculePropertiesResponse> {
    return handleApiCall(() => 
      apiClient.post('/molecules/properties', request)
    );
  }

  /**
   * Tìm kiếm phân tử theo CAS number (helper function)
   * @param casNumber - CAS number
   * @returns Thông tin phân tử hoặc null nếu không tìm thấy
   */
  static async findByCasNumber(casNumber: string): Promise<Molecule | null> {
    try {
      const result = await this.searchMolecules({ q: casNumber, limit: 1 });
      
      // Tìm phân tử có CAS number chính xác
      const exactMatch = result.molecules.find(
        mol => mol.cas_number === casNumber
      );
      
      return exactMatch || null;
    } catch (error) {
      console.error('Error finding molecule by CAS number:', error);
      return null;
    }
  }

  /**
   * Tìm kiếm phân tử theo tên (helper function)
   * @param name - Tên phân tử
   * @returns Danh sách phân tử phù hợp
   */
  static async findByName(name: string): Promise<Molecule[]> {
    try {
      const result = await this.searchMolecules({ q: name, limit: 20 });
      return result.molecules;
    } catch (error) {
      console.error('Error finding molecules by name:', error);
      return [];
    }
  }

  /**
   * Lấy khối lượng phân tử (helper function)
   * @param moleculeId - ID hoặc CAS number của phân tử
   * @returns Khối lượng phân tử (g/mol) hoặc null nếu không tìm thấy
   */
  static async getMolarMass(moleculeId: string): Promise<number | null> {
    try {
      const molecule = await this.getMoleculeDetails(moleculeId);
      return molecule.molar_mass;
    } catch (error) {
      console.error('Error getting molar mass:', error);
      return null;
    }
  }

  /**
   * Kiểm tra xem phân tử có tồn tại không
   * @param moleculeId - ID hoặc CAS number của phân tử
   * @returns true nếu phân tử tồn tại
   */
  static async moleculeExists(moleculeId: string): Promise<boolean> {
    try {
      await this.getMoleculeDetails(moleculeId);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Lấy danh sách gợi ý phân tử dựa trên input
   * @param input - Chuỗi input từ người dùng
   * @returns Danh sách gợi ý phân tử
   */
  static async getSuggestions(input: string): Promise<Molecule[]> {
    if (!input || input.length < 2) {
      return [];
    }

    try {
      const result = await this.searchMolecules({ q: input, limit: 5 });
      return result.molecules;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }
}

// Export default instance
export default MoleculesApiService; 