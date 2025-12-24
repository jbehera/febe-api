import { z } from 'zod';

/**
 * A generic factory that wraps any schema in the API's pagination structure.
 */
export const createPaginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) => {
  return z.object({
    pagination: z.object({
      total: z.number(),
      limit: z.coerce.number(), // Automatically converts "100" to 100
      offset: z.coerce.number(),
    }),
    data: z.array(itemSchema),
  });
  // .transform((val) => ({
  //   items: val.data,
  //   meta: val.pagination,
  // }));
};