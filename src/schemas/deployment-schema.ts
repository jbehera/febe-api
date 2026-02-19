import { z } from 'zod';
import { IdSchema, PaginatedCollection } from './common-schema';

export const DeploymentCore = {
  projectId: IdSchema,
  versionId: IdSchema,
  deploymentConfigurationId: IdSchema,
  deployedBy: z.string().min(1).max(100),
  status: z.string().min(1).max(100),
};

const deploymentRestFields = {
  ...DeploymentCore,
};

export const Deployment = {
  ListItemRes: z.object({
    response: z.object({
      ID: IdSchema,
      ...deploymentRestFields,
    }),
  }).transform((raw) => ({
    id: raw.response.ID,
    ...raw.response,
    ID: undefined,
  })),

  ListRes: PaginatedCollection(
    z.object({
      ID: IdSchema,
      ...deploymentRestFields,
    }).transform(({ ID, ...rest }) => ({
      id: ID,
      ...rest,
    }))
  ),

  List: z.object({
    rows: z.coerce.number().int().min(1).default(10),
    start: z.coerce.number().int().min(0).default(0),
  }),

  Create: z.object(deploymentRestFields),

  Update: z.object({
    id: IdSchema,
    ...deploymentRestFields,
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

export type DeploymentListReq = z.infer<typeof Deployment.List>;
export type DeploymentCreateReq = z.infer<typeof Deployment.Create>;
export type DeploymentUpdateReq = z.output<typeof Deployment.Update>;
