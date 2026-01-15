import { z } from 'zod';

/**
 * The standardized response format expected by our application logic.
 */
export interface RestAPIResponse<T> {
  status: number;
  message: string;
  data: T;
}

export const PaginationSchema = z.object({
  total: z.number(),
  limit: z.coerce.number(),
  offset: z.coerce.number(),
});

export const IdSchema = z.uuid();

/**
 * Shared metadata fields for resources
 */
export const ResourceMetadata = {
  createdBy: z.string().optional(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
};

export const GqlCollection = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    pagination: PaginationSchema,
  });

export const PaginatedCollection = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    pagination: PaginationSchema,
    data: z.array(itemSchema),
  });
  