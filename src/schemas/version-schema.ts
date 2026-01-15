import { z } from 'zod';
import { IdSchema, PaginatedCollection, ResourceMetadata } from './common-schema';

/**
 * Abstracted core fields for Version
 */
export const VersionCore = {
  name: z.string().min(1).max(100),
  description: z.string().max(255).optional().nullable(),
  schemaJson: z.string().optional(),
  status: z.coerce.number().default(1),
  notes: z.string().optional(),
  domain: z.string().url().optional().nullable(),
  graphQlUrl: z.string().url().optional().nullable(),
  restUrl: z.string().url().optional().nullable(),
};

const versionRestFields = {
  projectId: IdSchema,
  ...VersionCore,
};

export const Version = {
  // Manual ID -> id transformation for single item
  ListItemRes: z.object({
    response: z.object({
      ID: IdSchema,
      ...versionRestFields,
      ...ResourceMetadata,
    }),
  }).transform((raw) => ({
    id: raw.response.ID,
    ...raw.response,
    ID: undefined, // Cleanup
  })),

  // Manual ID -> id transformation for list
  ListRes: PaginatedCollection(
    z.object({
      ID: IdSchema,
      ...versionRestFields,
      ...ResourceMetadata,
    }).transform(({ ID, ...rest }) => ({
      id: ID,
      ...rest,
    }))
  ),

  List: z.object({
    projectId: IdSchema,
    rows: z.coerce.number().int().min(1).default(10),
    start: z.coerce.number().int().min(0).default(0),
  }),

  Create: z.object(versionRestFields),

  Update: z.object({
    id: IdSchema,
    ...versionRestFields,
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

// GraphQL Composition using manual transforms
export const VersionGqlItem = z.object({
  ID: IdSchema,
  ...VersionCore,
}).transform(({ ID, ...rest }) => ({
  id: ID,
  ...rest,
}));

export type VersionListReq = z.infer<typeof Version.List>;
export type VersionCreateReq = z.infer<typeof Version.Create>;
export type VersionUpdateReq = z.output<typeof Version.Update>;