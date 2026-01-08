import { httpClient } from '../utils/http-client';
import { graphqlClient } from '../utils/graphql-client';
import { FebeAPIConstants } from '../constants';
import {
  OrganizationCreateResponseSchema,
  OrganizationCreateSchema,
  OrganizationGetResponseSchema,
  UserOrganizationCreateSchema,
  UserOrganizationCreateResponseSchema,
  OrgHierarchyVariables,
  OrgHierarchySchema,
} from '../schemas';
import { GET_ORG_HIERARCHY } from './gql/queries';

export async function getOrganizationByQuery(query: string){
  const response = await httpClient.get(
    `${FebeAPIConstants.GET_ORGANIZATIONS}`,
    OrganizationGetResponseSchema,
    {
      params: { query },
    }
  );

  return response.data;
}

export async function createOrganization(
  organizationPayload: any,
  token?: string
) {
  // if token is provided, include it in the headers
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const payload = OrganizationCreateSchema.parse(organizationPayload);
  const response = await httpClient.post(
    FebeAPIConstants.CREATE_ORGANIZATION,
    payload,
    OrganizationCreateResponseSchema,
    {
      headers,
    }
  );

  return response.data;
}

export async function assignOrgUser(
  orgId: string,
  userId: string,
  token?: string
) {
  const payload = UserOrganizationCreateSchema.parse({ orgId, userId });
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await httpClient.post(
    FebeAPIConstants.CREATE_USER_ORG_MAPPING,
    payload,
    UserOrganizationCreateResponseSchema,
    {
      headers,
    }
  );

  return response.data;
}

export async function getOrgAndSubOrgWithEnvironments(variables: OrgHierarchyVariables) {
  const response = await graphqlClient.execute(
    GET_ORG_HIERARCHY,
    OrgHierarchySchema,
    variables
  );

  return response.data;
}
