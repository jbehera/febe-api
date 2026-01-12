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
      // timeout: 10000,
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

    this.client.interceptors.response.use(
      (response: AxiosResponse): AxiosResponse => {
        const context = getRequestContext();
        logger.info(
          `[${context?.traceId}] External API Success: ${response.status} ${response.config.url}`
        );
        return response;
      },

      // ERROR HANDLER (Updated for Centralized Middleware)
      (error: AxiosError): Promise<never> => {
        const context = getRequestContext();

        // 1. Determine the Status Code
        let statusCode = error.response?.status || 500;

        // 2. Capture the Raw Response Data
        // This is the "Message" or "responseMessage" object from the external API
        const responseData = error.response?.data;

        // 3. Handle specific Network/Timeout errors
        let fallbackMessage = 'Request failed (Unknown)';
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          statusCode = 504;
          fallbackMessage = 'External API took too long to respond.';
        } else if (error.request && !error.response) {
          statusCode = 503;
          fallbackMessage = 'No response from external service.';
        }

        // 4. Log the failure internally with trace ID
        logger.error(
          `[${context?.traceId}] External API Failure: ${statusCode}`,
          { errorDetails: responseData || error.message }
        );

        /**
         * Reject with an object that matches the "err" argument
         * expected by the errorMiddleware.
         */
        return Promise.reject({
          statusCode: statusCode, 
          data: responseData, 
          message: fallbackMessage,
        }) as Promise<never>;
      }
    );
  }

  /**
   * Helper to validate data against a Zod schema.
   */
  private validate<T extends z.ZodTypeAny>(
    schema: T,
    data: unknown
  ): z.infer<T> {
    const result = schema.safeParse(data);

    if (!result.success) {
      const errorDetails = z.treeifyError(result.error);
      logger.error('Zod Validation Failed', { errors: errorDetails });

      throw new AppError('Third-party API contract violation', 502);
    }

    return result.data;
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
}

export const httpClient = new HttpClient(
  process.env.FEBE_REST_API_BASE_URL || ''
);
