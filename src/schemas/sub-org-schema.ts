import { z } from 'zod';

export const SubOrganizationSchema = z.object({
  id: z.uuid(),
  orgId: z.uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(255).optional(),
});

export const SubOrganizationCreateSchema = z.object({
  orgId: z.uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(255).optional(),
});

export const SubOrganizationCreateResponseSchema = z.object({
  response: z.object({
    ID: z.uuid(),
    orgId: z.uuid(),
    name: z.string(),
    description: z.string().nullable().optional(),
  }),
}).transform((raw) => ({
  id: raw.response.ID,
  orgId: raw.response.orgId,
  name: raw.response.name,
  description: raw.response.description || undefined,
}));

export type SubOrganization = z.infer<typeof SubOrganizationSchema>;
