import { z } from 'zod';

/**
 * The standardized response format expected by our application logic.
 */
export interface RestAPIResponse<T> {
  status: number;
  message: string;
  data: T;
}

const PaginationSchema = z.object({
  total: z.number(),
  limit: z.coerce.number(), 
  offset: z.coerce.number(),
});

export const IdSchema = z.uuid();

export const GqlCollection = <T extends z.ZodTypeAny>(dataSchema: T) => 
  z.object({
    data: z.array(dataSchema),
    pagination: PaginationSchema,
  });
