import { GraphQLClient, RequestMiddleware, ClientError } from 'graphql-request';
import { z } from 'zod';
import { logger } from './logger';
import { AppError } from './app-error';
import { getRequestContext } from '../context/request-context';
import { RestAPIResponse } from '../schemas';

export class GraphqlClient {
  private client: GraphQLClient;

  constructor(endpoint: string) {
    this.client = new GraphQLClient(endpoint, {
      requestMiddleware: this.requestInterceptor,
    });
  }

  /**
   * Request Interceptor: Injects tokens, trace IDs, and logs outgoing queries.
   */
  private requestInterceptor: RequestMiddleware = async (request) => {
    const context = getRequestContext();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (context) {
      if (context.token) {
        headers['Authorization'] = `Bearer ${context.token}`;
      }
      if (context.traceId) {
        headers['x-request-id'] = context.traceId;
      }
    }

    logger.info(
      `Outgoing GraphQL Request: ${
        request.operationName || 'Unnamed Operation'
      }`
    );

    return {
      ...request,
      headers: { ...request.headers, ...headers },
    };
  };

  /**
   * Validates and transforms the GraphQL response using Zod.
   */
  private validate<T extends z.ZodTypeAny>(
    schema: T,
    data: unknown
  ): z.infer<T> {
    const result = schema.safeParse(data);

    if (!result.success) {
      console.error('--- ZOD VALIDATION ERROR DETAILS ---');
      console.error(JSON.stringify(result.error.format(), null, 2));

      const errorDetails = result.error.flatten();
      logger.error('Third-party API contract violation', {
        errors: errorDetails,
      });

      throw new AppError('Third-party API contract violation', 502);
    }

    return result.data;
  }

  /**
   * Normalizes GraphQL errors into your standard AppError format.
   */
  private handleClientError(error: any): never {
    const context = getRequestContext();
    let statusCode = 500;
    let message = 'GraphQL Request Failed';

    if (error instanceof ClientError) {
      statusCode = error.response.status || 400;
      // Extract the first error message from the GraphQL errors array
      message = error.response.errors?.[0]?.message || error.message;
    }

    logger.error(
      `[${context?.traceId}] GraphQL API Failure: ${statusCode} - ${message}`,
      {
        errorDetails:
          error instanceof ClientError ? error.response.errors : error,
      }
    );

    // Throwing to match your REST client's rejection behavior
    throw {
      status: statusCode,
      message: message,
      data: null,
    } as RestAPIResponse<any>;
  }

  /**
   * The core execution method.
   * @param query - The GraphQL document (string or AST)
   * @param schema - Zod schema for validation and transformation
   * @param variables - Query variables
   */
  public async execute<
    T extends z.ZodTypeAny,
    V extends Record<string, any> = {}
  >(
    query: string,
    schema: T,
    variables?: V
  ): Promise<RestAPIResponse<z.infer<T>>> {
    try {
      const data = await this.client.request<z.infer<T>>(query, variables);

      const context = getRequestContext();
      logger.info(`[${context?.traceId}] GraphQL API Success`);

      const validatedData = this.validate(schema, data);

      return {
        status: 200,
        message: 'Success',
        data: validatedData,
      };
    } catch (error) {
      return this.handleClientError(error);
    }
  }
}

export const graphqlClient = new GraphqlClient(
  process.env.FEBE_GRAPHQL_API_URL || ''
);
