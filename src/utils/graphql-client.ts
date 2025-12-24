import { GraphQLClient, RequestDocument, Variables } from 'graphql-request';
import { Request } from 'express'; // Or your specific framework types

/**
 * Interface for standard GraphQL Error responses
 */
export interface GqlError {
  message: string;
  extensions?: Record<string, any>;
}

/**
 * Configuration options for the client
 */
interface ClientConfig {
  endpoint: string;
  timeout?: number;
}

class GraphQLService {
  private client: GraphQLClient;

  constructor(config: ClientConfig) {
    this.client = new GraphQLClient(config.endpoint, {
      errorPolicy: 'all',
      // You can add global fetch options here (like timeouts)
    });
  }

  /**
   * The core execution method.
   * @template T The expected return type of the query
   * @template V The type of the variables object
   */
  public async execute<T, V extends Variables = Variables>(
    document: RequestDocument,
    variables: V
  ): Promise<T> {
    
    // 1. Context Extraction (Forwarding headers)
    // const headers = this.extractHeaders(incomingReq);

    try {
      // 2. Execute with request-specific headers
      // Note: request() headers override instance headers, ensuring isolation
      // return await this.client.request<T>(document, variables, headers);
      return await this.client.request<T>(document, variables);
    } catch (error: any) {
      this.handleErrors(error);
      throw error;
    }
  }

  /**
   * Private helper to safely extract and map headers
   */
  private extractHeaders(req: Request): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward Authorization
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    // Forward Correlation/Trace IDs for observability
    if (req.headers['x-request-id']) {
      headers['x-request-id'] = req.headers['x-request-id'] as string;
    }

    return headers;
  }

  /**
   * Centralized error logging and normalization
   */
  private handleErrors(error: any): void {
    const gqlErrors = error.response?.errors as GqlError[] | undefined;
    
    if (gqlErrors) {
      console.error(`[GQL Service Error]: ${gqlErrors.map(e => e.message).join(', ')}`);
    } else {
      console.error(`[Network Error]: ${error.message}`);
    }
  }
}

// Export a pre-configured instance (The "Singleton")
export const graphqlClient = new GraphQLService({
  endpoint: process.env.FEBE_GRAPHQL_API_URL || '',
});