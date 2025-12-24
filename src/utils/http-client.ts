import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';

import { z } from 'zod';
import { logger } from './logger';
import { AppError } from './app-error';
import { getRequestContext } from '../context/request-context';
import { RestAPIResponse } from '../schemas';

export class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.initializeInterceptors();
  }

  private initializeInterceptors() {
    // Request Interceptor: INJECTS TOKEN AUTOMATICALLY
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        logger.info(
          `Outgoing Request: ${config.method?.toUpperCase()} ${config.url}`
        );
        // Retrieve the context for the *current* executing request
        const context = getRequestContext();

        if (context) {
          if (context.token) {
            // Auto-inject the Authorization header
            config.headers.set('Authorization', `Bearer ${context.token}`);
          }

          // Optional: Forward Request ID for tracing across services
          if (context?.traceId) {
            config.headers.set('x-request-id', context.traceId);
          }
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    // 2. Response Interceptor: Error Handling & Data Extraction
    this.client.interceptors.response.use(
      // SUCCESS HANDLER
      (response: AxiosResponse): AxiosResponse => {
        const context = getRequestContext();
        // Log success, but return the original response object
        logger.info(
          `[${context?.traceId}] External API Success: ${response.status} ${response.config.url}`
        );
        return response;
      },

      // ERROR HANDLER
      (error: AxiosError): Promise<never> => {
        const context = getRequestContext();

        // --- Normalization Logic for Failure ---
        let statusCode = error.response?.status || 500;
        let errorMessage = 'Request failed (Unknown)';
        let responseData = error.response?.data;

        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          statusCode = 504; // Gateway Timeout
          errorMessage = 'External API took too long to respond.';
        } else if (error.response) {
          // Server responded with an error status (4xx, 5xx)
          const extMessage = this.extractExternalErrorMessage(responseData);
          errorMessage =
            extMessage || error.response.statusText || errorMessage;
        } else if (error.request) {
          // Request was made but no response received (network issue)
          statusCode = 503; // Service Unavailable
          errorMessage = 'No response from external service.';
        }

        // Log the failure with trace ID
        logger.error(
          `[${context?.traceId}] External API Failure: ${statusCode} - ${errorMessage}`,
          { errorDetails: responseData }
        );

        // Reject the Promise with a normalized error object
        return Promise.reject({
          status: statusCode,
          message: errorMessage,
          data: null,
        } as RestAPIResponse<any>) as Promise<never>;
      }
    );
  }

  /**
   * Helper to validate data against a Zod schema.
   */
  private validate<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
    const result = schema.safeParse(data);
    
    if (!result.success) {
      // Flattening errors makes them much easier to read in logs
      const errorDetails = result.error.flatten();
      logger.error('Zod Validation Failed', { errors: errorDetails });
      
      throw new AppError('Third-party API contract violation', 502);
    }
    
    return result.data;
  }

  private extractExternalErrorMessage(responseData: any): string | null {
    // Check for the non-standard failure format you provided:
    // { "Message": { "responseMessage": "User / password incorrect" } }
    if (responseData?.Message?.responseMessage) {
      return responseData.Message.responseMessage;
    }
    // Check for common error formats (e.g., Axios default)
    if (typeof responseData?.error === 'string') {
      return responseData.error;
    }
    return null;
  }

  public async get<T extends z.ZodTypeAny>(
    url: string,
    schema: T,
    config?: AxiosRequestConfig
  ): Promise<RestAPIResponse<z.infer<T>>> {
    const response = await this.client.get(url, config);
    const validatedData = this.validate(schema, response.data);

    return {
      status: response.status,
      message: 'Success',
      data: validatedData,
    };
  }

  public async post<T extends z.ZodTypeAny, D = unknown>(
    url: string,
    data: D,
    schema: T,
    config?: AxiosRequestConfig
  ): Promise<RestAPIResponse<z.infer<T>>> {
    const response = await this.client.post(url, data, config);
    const validatedData = this.validate(schema, response.data);

    return {
      status: response.status,
      message: 'Success',
      data: validatedData,
    };
  }

  public async put<T extends z.ZodTypeAny, D = unknown>(
    url: string,
    data: D,
    schema: T,
    config?: AxiosRequestConfig
  ): Promise<RestAPIResponse<z.infer<T>>> {
    const response = await this.client.put(url, data, config);
    const validatedData = this.validate(schema, response.data);

    return {
      status: response.status,
      message: 'Success',
      data: validatedData,
    };
  }

  public async delete<T extends z.ZodTypeAny>(
    url: string,
    schema: T,
    config?: AxiosRequestConfig
  ): Promise<RestAPIResponse<z.infer<T>>> {
    const response = await this.client.delete(url, config);
    const validatedData = this.validate(schema, response.data);

    return {
      status: response.status,
      message: 'Success',
      data: validatedData,
    };
  }

    // public async get<T>(
  //   url: string,
  //   config?: AxiosRequestConfig
  // ): Promise<RestAPIResponse<T>> {
  //   const response = await this.client.get<T>(url, config);
  //   return {
  //     status: response.status,
  //     message: response.statusText || 'Success',
  //     data: response.data,
  //   };
  // }

  // public async post<T, D = unknown>(
  //   url: string,
  //   data: D,
  //   config?: AxiosRequestConfig
  // ): Promise<RestAPIResponse<T>> {
  //   const response = await this.client.post<T>(url, data, config);
  //   return {
  //     status: response.status,
  //     message: response.statusText || 'Success',
  //     data: response.data,
  //   };
  // }

  // public async put<T, D = unknown>(
  //   url: string,
  //   data: D,
  //   config?: AxiosRequestConfig
  // ): Promise<RestAPIResponse<T>> {
  //   const response = await this.client.put<T>(url, data, config);
  //   return {
  //     status: response.status,
  //     message: response.statusText || 'Success',
  //     data: response.data,
  //   };
  // }

  // public async delete<T>(
  //   url: string,
  //   config?: AxiosRequestConfig
  // ): Promise<RestAPIResponse<T>> {
  //   const response = await this.client.delete<T>(url, config);
  //   return {
  //     status: response.status,
  //     message: response.statusText || 'Success',
  //     data: response?.data,
  //   };
  // }
}

export const httpClient = new HttpClient(
  process.env.FEBE_REST_API_BASE_URL || ''
);
