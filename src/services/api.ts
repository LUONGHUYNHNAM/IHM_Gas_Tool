import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Base URL cho API - có thể thay đổi qua environment variable
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Performance tracking map
const requestTimers = new Map<string, number>();

// Simple logger replacement
const logger = {
  info: (category: string, message: string, data?: any) => 
    console.log(`ℹ️ [${category}] ${message}`, data || ''),
  error: (category: string, message: string, data?: any) => 
    console.error(`🔴 [${category}] ${message}`, data || ''),
  warn: (category: string, message: string, data?: any) => 
    console.warn(`⚠️ [${category}] ${message}`, data || ''),
  debug: (category: string, message: string, data?: any) => 
    console.debug(`🟢 [${category}] ${message}`, data || ''),
  apiRequest: (method: string, url: string, data?: any) =>
    console.log(`📤 [API] ${method} ${url}`, data || ''),
  apiResponse: (method: string, url: string, status: number, data?: any) =>
    console.log(`📥 [API] ${method} ${url} -> ${status}`, data || ''),
  apiError: (method: string, url: string, error: any) =>
    console.error(`❌ [API] ${method} ${url} failed`, error)
};

// Tạo axios instance với cấu hình mặc định
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // Tăng timeout lên 15 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor để log requests
apiClient.interceptors.request.use(
  (config) => {
    const method = config.method?.toUpperCase() || 'UNKNOWN';
    const url = `${config.baseURL}${config.url}`;
    const requestId = `${method}-${url}-${Date.now()}`;
    
    logger.apiRequest(method, url, config.data);
    
    // Track performance
    requestTimers.set(requestId, performance.now());
    config.headers['X-Request-ID'] = requestId;
    
    return config;
  },
  (error) => {
    logger.error('API', 'Request setup failed', error);
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý responses và errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const method = response.config.method?.toUpperCase() || 'UNKNOWN';
    const url = response.config.url || 'unknown';
    const requestId = response.config.headers['X-Request-ID'] as string;
    const startTime = requestTimers.get(requestId) || 0;
    const duration = performance.now() - startTime;
    
    // Clean up timer
    if (requestId) requestTimers.delete(requestId);
    
    logger.apiResponse(method, url, response.status, {
      duration: `${duration.toFixed(2)}ms`,
      dataSize: JSON.stringify(response.data).length
    });
    
    return response;
  },
  (error: AxiosError) => {
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
    const url = error.config?.url || 'unknown';
    const requestId = error.config?.headers?.['X-Request-ID'] as string;
    const startTime = requestTimers.get(requestId) || 0;
    const duration = performance.now() - startTime;
    
    // Clean up timer
    if (requestId) requestTimers.delete(requestId);
    
    const errorDetails = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      duration: `${duration.toFixed(2)}ms`,
      responseData: error.response?.data
    };
    
    logger.apiError(method, url, errorDetails);
    
    // Xử lý các loại lỗi khác nhau với detailed logging
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          logger.error('API', 'Bad Request', { url, data });
          break;
        case 401:
          logger.error('API', 'Unauthorized', { url, data });
          break;
        case 403:
          logger.error('API', 'Forbidden', { url, data });
          break;
        case 404:
          logger.error('API', 'Not Found', { url, data });
          break;
        case 500:
          logger.error('API', 'Internal Server Error', { url, data });
          break;
        case 502:
          logger.error('API', 'Bad Gateway - Server không phản hồi', { url });
          break;
        case 503:
          logger.error('API', 'Service Unavailable', { url });
          break;
        default:
          logger.error('API', `HTTP ${status} Error`, { url, data });
      }
    } else if (error.request) {
      logger.error('API', 'Network Error - Không nhận được phản hồi từ server', {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout
      });
    } else {
      logger.error('API', 'Request Setup Error', { message: error.message });
    }
    
    return Promise.reject(error);
  }
);

// Interface cho API error response
export interface ApiError {
  error: boolean;
  message: string;
  error_code?: string;
  details?: any;
}

// Interface cho API response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Enhanced helper function để xử lý API calls với retry logic
export const handleApiCall = async <T>(
  apiCall: () => Promise<AxiosResponse<T>>,
  retries: number = 2
): Promise<T> => {
  let lastError: Error = new Error('Unknown error');
  
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      logger.debug('API', `Attempt ${attempt}/${retries + 1}`);
      const response = await apiCall();
      return response.data;
    } catch (error) {
      lastError = error as Error;
      
      if (axios.isAxiosError(error)) {
        // Không retry cho client errors (4xx)
        if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
          logger.warn('API', `Client error ${error.response.status}, không retry`);
          break;
        }
        
        // Retry cho network errors và server errors (5xx)
        if (attempt <= retries) {
          const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
          logger.info('API', `Retry sau ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      break;
    }
  }
  
  // Xử lý error cuối cùng
  if (axios.isAxiosError(lastError) && lastError.response?.data) {
    const apiError = lastError.response.data as ApiError;
    throw new Error(apiError.message || `API call failed: ${lastError.message}`);
  }
  
  throw new Error(`Network error: ${lastError.message}`);
};

// Health check function với detailed logging
export const checkApiHealth = async (): Promise<{ status: string; timestamp: string }> => {
  const startTime = performance.now();
  try {
    logger.info('API', 'Starting health check...');
    const result = await handleApiCall(() => apiClient.get('/health'));
    const duration = performance.now() - startTime;
    logger.info('API', `Health check successful in ${duration.toFixed(2)}ms`, result);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error('API', `Health check failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};

// Test connection function
export const testConnection = async (): Promise<boolean> => {
  try {
    await checkApiHealth();
    return true;
  } catch (error) {
    logger.error('API', 'Connection test failed', error);
    return false;
  }
};

export default apiClient; 