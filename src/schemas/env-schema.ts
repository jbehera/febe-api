import { z } from 'zod';

export const EnvironmentSchema = z.object({
  id: z.uuid(),
  orgId: z.uuid().nullable().optional(),
  subOrgId: z.uuid().nullable().optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(255).optional(),
});

export const EnvironmentCreateSchema = z.object({
  orgId: z.uuid(),
  subOrgId: z.uuid().nullable().optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(255).optional(),
});

export const EnvironmentCreateResponseSchema = z.object({
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
  description: raw.response.description || undefined,
}));

