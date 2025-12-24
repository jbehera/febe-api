import { z } from 'zod';

export const settingsSchema = z.object({
  ID: z.uuid(),
  userId: z.uuid(),
  orgId: z.uuid(),
  subOrgId: z.uuid().nullable(),
  environmentId: z.uuid(),
}).transform((data) => ({
  id: data.ID,
  userId: data.userId,
  orgId: data.orgId,
  subOrgId: data.subOrgId,
  environmentId: data.environmentId,
}));

export const singleSettingsSchema = z.preprocess(
  (data) => {
    if(Array.isArray(data)) {
      return data[0];
    }
    return data;
  },
  settingsSchema
);
// export type SettingsRequest = z.infer<typeof settingsSchema>;
