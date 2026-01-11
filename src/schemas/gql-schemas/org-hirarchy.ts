import { z } from 'zod';
import { GqlCollection } from '../common-schema';
import { Env } from '../env-schema';

export const OrgHierarchySchema = z.object({
  organizations: GqlCollection(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable().optional(),
      environments: GqlCollection(Env.Base),
      subOrganizations: GqlCollection(
        z.object({
          id: z.string(),
          orgId: z.string(),
          name: z.string(),
          description: z.string().nullable().optional(),
          environments: GqlCollection(Env.Base),
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
