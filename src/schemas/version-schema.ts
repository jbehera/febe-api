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
  domain: z.url().optional().nullish(),
  graphQlUrl: z.url().optional().nullish(),
  restUrl: z.url().optional().nullish(),
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
    status: z.int().optional(),
    rows: z.coerce.number().int().min(1).default(10),
    start: z.coerce.number().int().min(0).default(0),
    sort: z.string().optional()
  }),

  Create: z.object(versionRestFields),

  Publish: z.object({
    id: IdSchema,
    settingsId: IdSchema,
    projectId: IdSchema,
    projectName: z.string(),
    schemaJson: z.string(),
    // schemaJson: z
    //   .record(z.string(), z.any())
    //   .refine((obj) => Object.keys(obj).length > 0, {
    //     message: "schemJson cannot be an empty object",
    //   }),
    transformedJson: z
      .record(z.string(), z.any())
      .refine((obj) => Object.keys(obj).length > 0, {
        message: "transformedJson cannot be an empty object",
      }),
    incrementType: z.union([z.literal('major'), z.literal('minor'), z.literal('patch')]).default('major')
  }),

  Update: z.object({
    id: IdSchema,
    ...versionRestFields,
    name: z.string().optional(), // override name field to be optional in Update
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
export type VersionUpdateReq = z.input<typeof Version.Update>;
