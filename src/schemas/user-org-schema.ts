import { z } from 'zod';

export const UserOrganizationSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  orgId: z.uuid(),
});

export const UserOrganizationCreateSchema = z.object({
  userId: z.uuid(),
  orgId: z.uuid(),
});

export const UserOrganizationCreateResponseSchema = z.object({
  response: z.object({
    ID: z.uuid(),
    userId: z.uuid(),
    orgId: z.uuid(),
  }),
}).transform((raw) => ({
  id: raw.response.ID,
  userId: raw.response.userId,
  orgId: raw.response.orgId,
}));

export type UserOrganization = z.infer<typeof UserOrganizationSchema>;