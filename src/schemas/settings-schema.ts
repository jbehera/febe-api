import { z } from 'zod';
import { IdSchema, PaginatedCollection, ResourceMetadata } from './common-schema';

/**
 * Abstracted core fields for UserSettings
 */
export const UserSettingCore = {
  orgId: IdSchema,
  subOrgId: IdSchema.nullish(),
  environmentId: IdSchema,
  userId: IdSchema, // Mapping to the userId varchar
};

export const UserSetting = {
  // Response mapping for a single item (ID -> id)
  ListItemRes: z.object({
    response: z.object({
      ID: IdSchema,
      ...UserSettingCore
    }),
  }).transform((raw) => {
    const { ID, ...rest } = raw.response;
    return { id: ID, ...rest };
  }),

  // Paginated List Response
  ListRes: PaginatedCollection(
    z.object({
      ID: IdSchema,
      ...UserSettingCore,
    }).transform(({ ID, ...rest }) => ({
      id: ID,
      ...rest,
    }))
  ),

  // Input for GET Query Parameters
  List: z.object({
    userId: z.string().optional(),
    envId: IdSchema.optional(),
    rows: z.coerce.number().int().min(1).default(10),
    start: z.coerce.number().int().min(0).default(0),
  }),

  // Input for POST (Create)
  Create: z.object(UserSettingCore),

  // Input for PUT (Update)
  Update: z.object({
    id: IdSchema,
    ...UserSettingCore,
  }).transform(({ id, ...rest }) => ({
    ID: id,
    ...rest,
  })),

  // Standard Delete Response
  DeleteRes: z.object({
    responseMessage: z.string(),
  }).transform(data => ({
    message: data.responseMessage
  })),
};

export type UserSettingListReq = z.infer<typeof UserSetting.List>;
export type UserSettingCreateReq = z.infer<typeof UserSetting.Create>;
export type UserSettingUpdateReq = z.output<typeof UserSetting.Update>;
