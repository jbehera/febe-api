import { z } from 'zod';
import { IdSchema, PaginatedCollection } from './common-schema';

export const ConfigurationCore = {
  replicaSize: z.string().min(1).max(100),
};

const configurationRestFields = {
  ...ConfigurationCore,
};

export const Configuration = {
  ListItemRes: z.object({
    response: z.object({
      ID: IdSchema,
      ...configurationRestFields,
    }),
  }).transform((raw) => {
    const { ID, ...rest } = raw.response;
    return { id: ID, ...rest };
  }),

  ListRes: PaginatedCollection(
    z.object({
      ID: IdSchema,
      ...configurationRestFields,
    }).transform(({ ID, ...rest }) => ({
      id: ID,
      ...rest,
    }))
  ),

  List: z.object({
    rows: z.coerce.number().int().min(1).default(10),
    start: z.coerce.number().int().min(0).default(0),
  }),

  Create: z.object(configurationRestFields),

  Update: z.object({
    id: IdSchema,
    ...configurationRestFields,
  }).transform(({ id, ...rest }) => ({
    ID: id,
    ...rest,
  })),

  DeleteRes: z.object({
    responseMessage: z.string(),
  }).transform(data => ({
    message: data.responseMessage
  })),
};

export type ConfigurationListReq = z.infer<typeof Configuration.List>;
export type ConfigurationCreateReq = z.infer<typeof Configuration.Create>;
export type ConfigurationUpdateReq = z.output<typeof Configuration.Update>;
