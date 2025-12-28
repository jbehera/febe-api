import { z } from 'zod';

export const OrganizationSchema = z.object({
  ID: z.uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(255).optional(),
});

export const OrganizationCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(255).optional(),
});

export const OrganizationGetResponseSchema = z
  .object({
    pagination: z.object({
      total: z.number(),
    }),
    data: z.array(
      OrganizationSchema
    ),
  })
  .transform((val) => {
    const rawSetting = val.data[0];
    if (!rawSetting) {
      return null;
    }
    return {
      id: rawSetting.ID,
      name: rawSetting.name,
      description: rawSetting.description,
    };
  });

export const OrganizationCreateResponseSchema = z.object({
  response: z.object({
    ID: z.uuid(),
    name: z.string(),
    description: z.string().nullable().optional(),
  }),
}).transform((raw) => ({
  id: raw.response.ID,
  name: raw.response.name,
  description: raw.response.description || undefined,
}));

export type Organization = z.infer<typeof OrganizationSchema>;
