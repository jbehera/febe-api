import { z } from 'zod';
import { IdSchema, PaginatedCollection } from './common-schema';

export const DeploymentConfigurationCore = {
  configurationId: IdSchema,
  replicaCount: z.string().min(1).max(100),
};

const deploymentConfigurationRestFields = {
  ...DeploymentConfigurationCore,
};

export const DeploymentConfiguration = {
  ListItemRes: z.object({
    response: z.object({
      ID: IdSchema,
      ...deploymentConfigurationRestFields,
    }),
  }).transform((raw) => {
    const { ID, ...rest } = raw.response;
    return { id: ID, ...rest };
  }),

  ListRes: PaginatedCollection(
    z.object({
      ID: IdSchema,
      ...deploymentConfigurationRestFields,
    }).transform(({ ID, ...rest }) => ({
      id: ID,
      ...rest,
    }))
  ),

  List: z.object({
    rows: z.coerce.number().int().min(1).default(10),
    start: z.coerce.number().int().min(0).default(0),
  }),

  Create: z.object(deploymentConfigurationRestFields),

  Update: z.object({
    id: IdSchema,
    ...deploymentConfigurationRestFields,
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

export type DeploymentConfigurationListReq = z.infer<typeof DeploymentConfiguration.List>;
export type DeploymentConfigurationCreateReq = z.infer<typeof DeploymentConfiguration.Create>;
export type DeploymentConfigurationUpdateReq = z.output<typeof DeploymentConfiguration.Update>;
