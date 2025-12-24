/**
 * The standardized response format expected by our application logic.
 */
export interface RestAPIResponse<T> {
  status: number;
  message: string;
  data: T | null;
}

