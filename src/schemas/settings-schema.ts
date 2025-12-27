import { z } from 'zod';

export const SettingsGetSchema = z
  .object({
    pagination: z.object({
      total: z.number(),
    }),
    data: z.array(
      z.object({
        ID: z.uuid(),
        userId: z.uuid(),
        orgId: z.uuid(),
        subOrgId: z.uuid().nullable().optional(),
        environmentId: z.uuid(),
      })
    ),
  })
  .transform((val) => {
    const rawSetting = val.data[0];
    if (!rawSetting) {
      return null;
    }
    return {
      id: rawSetting.ID,
      userId: rawSetting.userId,
      orgId: rawSetting.orgId,
      subOrgId: rawSetting?.subOrgId || null,
      environmentId: rawSetting.environmentId,
    };
  });

export const SettingsCreateSchema = z.object({
  userId: z.uuid(),
  orgId: z.uuid(),
  subOrgId: z.uuid().nullable().optional(),
  environmentId: z.uuid(),
});

export const SettingsCreateResponseSchema = z.object({
  response: z.object({
    ID: z.uuid(),
    userId: z.uuid(),
    orgId: z.uuid(),
    subOrgId: z.uuid().nullable().optional(),
    environmentId: z.uuid(),
  }),
}).transform((raw) => ({
  id: raw.response.ID,
  userId: raw.response.userId,
  orgId: raw.response.orgId,
  subOrgId: raw.response.subOrgId,
  environmentId: raw.response.environmentId,
}));