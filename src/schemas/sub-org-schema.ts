import { z } from 'zod';
import { IdSchema } from './common-schema';

const coreFields = {
  orgId: IdSchema,
  name: z.string().min(1).max(100),
  description: z.string().max(255).optional(),
};

export const SubOrg = {
  // Input for POST
  Create: z.object(coreFields),

  // Input for PUT (Transforms id -> ID for third-party API)
  Update: z.object({
    id: IdSchema,
    ...coreFields,
  }).transform(({ id, ...rest }) => ({
    ID: id,
    ...rest,
  })),

  // Response mapping for Single Item (Transforms ID -> id back for internal use)
  ItemRes: z.object({
    response: z.object({
      ID: IdSchema,
      orgId: IdSchema.nullish(),
      name: z.string(),
      description: z.string().nullable().optional(),
    }),
  }).transform((raw) => ({
    id: raw.response.ID,
    orgId: raw.response.orgId,
    name: raw.response.name,
    description: raw.response.description ?? undefined,
  })),

  // Standard Delete Response
  DeleteRes: z.object({
    responseMessage: z.string(),
  }).transform(data => ({
    message: data.responseMessage
  })),
};

// Type exports for Service layer
export type SubOrgCreateReq = z.infer<typeof SubOrg.Create>;
export type SubOrgUpdateReq = z.output<typeof SubOrg.Update>;
