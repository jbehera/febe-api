import { z } from 'zod';
import { IdSchema, PaginatedCollection, GqlCollection, ResourceMetadata } from './common-schema';
import { VersionCore, VersionGqlItem } from './version-schema';

/**
 * Abstracted core fields for Project
 */
export const ProjectCore = {
  orgId: IdSchema,
  subOrgId: IdSchema.nullish(),
  name: z.string().min(1).max(100),
  description: z.string().max(255).optional().nullable(),
};

const projectRestFields = {
  ...ProjectCore,
  environmentId: IdSchema,
};

export const Project = {
  ListItemRes: z.object({
    response: z.object({
      ID: IdSchema,
      ...projectRestFields,
    }),
  }).transform((raw) => {
    const { ID, ...rest } = raw.response;
    return { id: ID, ...rest };
  }),

  ListRes: PaginatedCollection(
    z.object({
      ID: IdSchema,
      ...projectRestFields,
      
    }).transform(({ ID, ...rest }) => ({
      id: ID,
      ...rest,
    }))
  ),

  List: z.object({
    envId: IdSchema,
    orgId: IdSchema.nullish(),
    subOrgId: IdSchema.nullish(),
    rows: z.coerce.number().int().min(1).default(10),
    start: z.coerce.number().int().min(0).default(0),
  }),

  Create: z.object(projectRestFields),

  Update: z.object({
    id: IdSchema,
    ...projectRestFields,
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

const ProjectGqlItem = z.object({
  id: IdSchema, // GraphQL uses lowercase id for projects
  ...ProjectCore,
  versions: GqlCollection(VersionGqlItem),
});

export const ProjectGql = {
  ListItem: ProjectGqlItem,
  Response: z.object({
    data: z.object({
      projects: GqlCollection(ProjectGqlItem),
    }),
  }).transform(raw => raw.data.projects),
};

export type ProjectListReq = z.infer<typeof Project.List>;
export type ProjectCreateReq = z.infer<typeof Project.Create>;
export type ProjectUpdateReq = z.output<typeof Project.Update>;
export type ProjectWithVersions = z.infer<typeof ProjectGql.Response>;