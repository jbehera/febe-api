import { z } from 'zod';
import { IdSchema, PaginatedCollection } from './common-schema';

const coreFields = {
  orgId: IdSchema,
  subOrgId: IdSchema.nullish(),
  environmentId: IdSchema,
  name: z.string().min(1).max(100),
  description: z.string().max(255).optional(),
};

export const Project = {
  // ListItem: z.object({
  //   ID: IdSchema,
  //   ...coreFields,
  // }).transform(({ ID, ...rest }) => ({
  //   id: ID,
  //   ...rest,
  // })),

  ListItem: z.object({
    response: z.object({
      ID: IdSchema,
      ...coreFields
    }),
  }).transform((raw) => ({
    id: raw.response.ID,
    orgId: raw.response.orgId,
    subOrgId: raw.response.subOrgId,
    environmentId: raw.response.environmentId,
    name: raw.response.name,
    description: raw.response.description
  })),

  ListRes: PaginatedCollection(
    z.object({
      ID: IdSchema,
      ...coreFields,
    }).transform(({ ID, ...rest }) => ({
      id: ID,
      ...rest,
    }))
  ),
  // Input for POST
  Create: z.object(coreFields),

  // Input for PUT (Transforms id -> ID for the external service)
  Update: z.object({
    id: IdSchema,
    ...coreFields,
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

// Type exports for Service layer
export type ProjectCreateReq = z.infer<typeof Project.Create>;
export type ProjectUpdateReq = z.output<typeof Project.Update>;
