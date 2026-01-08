import { z } from 'zod';
import { GqlCollection } from '../common-schema';
import { EnvironmentSchema } from '../env-schema';

export const OrgHierarchySchema = z.object({
  organizations: GqlCollection(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable().optional(),
      environments: GqlCollection(EnvironmentSchema),
      subOrganizations: GqlCollection(
        z.object({
          id: z.string(),
          orgId: z.string(),
          name: z.string(),
          description: z.string().nullable().optional(),
          environments: GqlCollection(EnvironmentSchema),
        })
      ),
    })
  ),
});

// Derived Types
export type OrgHierarchyResponse = z.infer<typeof OrgHierarchySchema>;

export interface OrgHierarchyVariables {
  query: string;
}
