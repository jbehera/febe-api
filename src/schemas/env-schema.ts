import { z } from 'zod';

/**
 * Common fields used to maintain DRY (Don't Repeat Yourself)
 */
const coreFields = {
  orgId: z.uuid(),
  subOrgId: z.uuid().nullable().optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(255).optional(),
};

export const Env = {
  // The base object for internal use
  Base: z.object({
    id: z.uuid(),
    ...coreFields,
  }),

  // Request Schemas (Inputs)
  Create: z.object(coreFields),

  Update: z.object({
    id: z.uuid(),
    ...coreFields,
  }).transform(({ id, ...rest }) => ({
    ID: id, // Transform to third-party format
    ...rest,
  })),

  // Response Schemas (Outputs)
  // Standardizing names to 'Res' or 'Item'
  ItemRes: z.object({
    response: z.object({
      ID: z.uuid(),
      orgId: z.uuid(),
      subOrgId: z.uuid().nullable().optional(),
      name: z.string(),
      description: z.string().nullable().optional(),
    }),
  }).transform((raw) => ({
    id: raw.response.ID,
    orgId: raw.response.orgId,
    subOrgId: raw.response.subOrgId,
    name: raw.response.name,
    description: raw.response.description ?? undefined,
  })),

  DeleteRes: z.object({
    responseMessage: z.string(),
  }).transform(data => ({
    message: data.responseMessage,
  })),
};

/**
 * Types inferred from schemas for Service/Controller use
 */
export type EnvCreateReq = z.infer<typeof Env.Create>;
export type EnvUpdateReq = z.output<typeof Env.Update>; // Uses output because of transform
export type EnvItem = z.output<typeof Env.ItemRes>;
