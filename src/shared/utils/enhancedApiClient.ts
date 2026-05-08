import { ApiResponse, ApiError } from './apiClient';

export interface RetryConfig {
  maxRetries?: number;
  delayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  retryCondition?: (error: any) => boolean;
}

export interface CircuitBreakerConfig {
  failureThreshold?: number;
  resetTimeoutMs?: number;
  monitoringPeriodMs?: number;
}

export interface LogConfig {
  enableRequestLogging?: boolean;
  enableResponseLogging?: boolean;
  enableErrorLogging?: boolean;
  sanitizeHeaders?: boolean;
}

export interface EnhancedApiConfig {
  retry?: RetryConfig;
  circuitBreaker?: CircuitBreakerConfig;
  logging?: LogConfig;
  timeoutMs?: number;
}

export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private config: Required<CircuitBreakerConfig>;

  constructor(config: CircuitBreakerConfig) {
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      resetTimeoutMs: config.resetTimeoutMs || 60000,
      monitoringPeriodMs: config.monitoringPeriodMs || 60000,
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeoutMs) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.config.failureThreshold) {
      this.state = 'open';
    }
  }

  getState() {
    return this.state;
  }
}

export class ApiLogger {
  private config: Required<LogConfig>;

  constructor(config: LogConfig) {
    this.config = {
      enableRequestLogging: config.enableRequestLogging ?? true,
      enableResponseLogging: config.enableResponseLogging ?? true,
      enableErrorLogging: config.enableErrorLogging ?? true,
      sanitizeHeaders: config.sanitizeHeaders ?? true,
    };
  }

  logRequest(url: string, options: RequestInit, timestamp: number) {
    if (!this.config.enableRequestLogging) return;

    const duration = Date.now() - timestamp;
    const sanitizedOptions = this.sanitizeOptions(options);

    console.log(`[API Request] ${options.method || 'GET'} ${url}`, {
      duration: `${duration}ms`,
      options: sanitizedOptions,
    });
  }

  logResponse(url: string, response: any, duration: number, success: boolean) {
    if (!this.config.enableResponseLogging) return;

    console.log(`[API Response] ${url}`, {
      status: response?.status,
      duration: `${duration}ms`,
      success,
    });
  }

  logError(url: string, error: any, duration: number) {
    if (!this.config.enableErrorLogging) return;

    console.error(`[API Error] ${url}`, {
      error: this.sanitizeError(error),
      duration: `${duration}ms`,
    });
  }

  private sanitizeOptions(options: RequestInit) {
    if (!this.config.sanitizeHeaders) return options;

    const sanitized = { ...options };
    if (sanitized.headers) {
      const headers = new Headers(sanitized.headers);
      const authHeader = headers.get('Authorization');
      if (authHeader) {
        headers.set('Authorization', '***REDACTED***');
      }
      sanitized.headers = headers;
    }
    return sanitized;
  }

  private sanitizeError(error: any) {
    if (!this.config.sanitizeHeaders) return error;

    const sanitized = { ...error };
    if (sanitized.config?.headers) {
      const headers = new Headers(sanitized.config.headers);
      const authHeader = headers.get('Authorization');
      if (authHeader) {
        headers.set('Authorization', '***REDACTED***');
      }
      sanitized.config.headers = headers;
    }
    return sanitized;
  }
}

export class RetryHandler {
  private config: Required<RetryConfig>;

  constructor(config: RetryConfig) {
    this.config = {
      maxRetries: config.maxRetries || 3,
      delayMs: config.delayMs || 1000,
      maxDelayMs: config.maxDelayMs || 30000,
      backoffFactor: config.backoffFactor || 2,
      retryCondition: config.retryCondition || this.defaultRetryCondition,
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === this.config.maxRetries || !this.config.retryCondition(error)) {
          throw error;
        }

        const delay = Math.min(
          this.config.delayMs * Math.pow(this.config.backoffFactor, attempt),
          this.config.maxDelayMs
        );

        await this.sleep(delay + Math.random() * 1000);
      }
    }

    throw lastError;
  }

  private defaultRetryCondition(error: any): boolean {
    if (error?.status) {
      return [408, 429, 500, 502, 503, 504].includes(error.status);
    }
    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class EnhancedApiClient {
  private circuitBreaker: CircuitBreaker;
  private retryHandler: RetryHandler;
  private logger: ApiLogger;
  private config: Required<EnhancedApiConfig>;

  constructor(config: EnhancedApiConfig = {}) {
    this.config = {
      retry: config.retry || {},
      circuitBreaker: config.circuitBreaker || {},
      logging: config.logging || {},
      timeoutMs: config.timeoutMs || 30000,
    };

    this.circuitBreaker = new CircuitBreaker(this.config.circuitBreaker);
    this.retryHandler = new RetryHandler(this.config.retry);
    this.logger = new ApiLogger(this.config.logging);
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();

    try {
      const result = await this.circuitBreaker.execute(async () => {
        return this.retryHandler.execute(async () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

          try {
            const response = await fetch(endpoint, {
              ...options,
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const data: ApiResponse<T> = await response.json().catch(() => ({
              success: false,
              code: response.status,
              data: null,
              mess: response.statusText,
            }));

            if (!response.ok) {
              throw data;
            }

            return data;
          } catch (error) {
            clearTimeout(timeoutId);
            throw error;
          }
        });
      });

      const duration = Date.now() - startTime;
      this.logger.logResponse(endpoint, result, duration, true);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.logError(endpoint, error, duration);
      throw error;
    }
  }

  async get<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T>(url: string, body: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });
  }

  async put<T>(url: string, body: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });
  }

  async patch<T>(url: string, body: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });
  }

  async delete<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
}

export const enhancedApi = new EnhancedApiClient({
  retry: {
    maxRetries: 3,
    delayMs: 1000,
    maxDelayMs: 30000,
    backoffFactor: 2,
  },
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeoutMs: 60000,
  },
  logging: {
    enableRequestLogging: process.env.NODE_ENV !== 'production',
    enableResponseLogging: process.env.NODE_ENV !== 'production',
    enableErrorLogging: true,
  },
  timeoutMs: 30000,
});