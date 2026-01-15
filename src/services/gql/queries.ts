import { gql } from 'graphql-request';

export const GET_USER_INFO = gql`
  query GetUserInfo($query: String, $token: String) {
    user: finduserByQuery(
      query: $query
      start: "0"
      rows: "9"
      filterField: ""
      filterQuery: ""
      sort: ""
      advanceField: ""
      advanceQuery: ""
      advance: "true"
      token: $token
    ) {
      data {
        userId: ID
        firstName
        middleName
        lastName
        email
        settings: finduserSettingByQuery(
          query: "userId:\${ID}"
          start: "0"
          rows: "9"
          filterField: ""
          filterQuery: ""
          sort: ""
          advanceField: ""
          advanceQuery: ""
          advance: "true"
          token: $token
        ) {
          data {
            orgId
            subOrgId
            environmentId
          }
          pagination {
            total
            limit
            offset
          }
        }
      }
      pagination {
        total
        limit
        offset
      }
    }
  }
`;

export const GET_ORG_HIERARCHY = gql`
  query GetOrgHirarchy($query: String) {
    organizations: findorganizationByQuery(
      query: $query
      start: "0"
      rows: "9"
      filterField: ""
      filterQuery: ""
      sort: ""
      advanceField: ""
      advanceQuery: ""
      advance: "true"
    ) {
      data {
        id: ID
        name
        description
        environments: findenvironmentByQuery(
          query: "orgId:\${ID}"
          start: "0"
          rows: "9"
          filterField: ""
          filterQuery: ""
          sort: ""
          advanceField: ""
          advanceQuery: ""
          advance: "true"
        ) {
          data {
            id: ID
            orgId
            subOrgId
            name
            description
          }
          pagination {
            total
            limit
            offset
          }
        }
        subOrganizations: findsubOrganizationByQuery(
          query: "orgId:\${ID}"
          start: "0"
          rows: "9"
          filterField: ""
          filterQuery: ""
          sort: ""
          advanceField: ""
          advanceQuery: ""
          advance: "true"
        ) {
          data {
            id: ID
            name
            description
            orgId
            environments: findenvironmentByQuery(
              query: "subOrgId:\${ID}"
              start: "0"
              rows: "9"
              filterField: ""
              filterQuery: ""
              sort: ""
              advanceField: ""
              advanceQuery: ""
              advance: "true"
            ) {
              data {
                id: ID
                orgId
                subOrgId
                name
                description
              }
              pagination {
                total
                limit
                offset
              }
            }
          }
          pagination {
            total
            limit
            offset
          }
        }
      }
      pagination {
        total
        limit
        offset
      }
    }
  }
`;

export const GET_PROJECT_WITH_VERSION_SUMMARY = gql`
  query GetProjectWithVersionSummary($query: String, $offset: String, $limit: String) {
    projects: findprojectByQuery(
      query: $query
      start: $offset
      rows: $limit
      filterField: ""
      filterQuery: ""
      sort: ""
      advanceField: ""
      advanceQuery: ""
      advance: "true"
    ) {
      data {
        id: ID
        name
        description
        orgId
        subOrgId
        createdAt
        updatedAt
        versions: findversionByQuery(
          query: "projectId:\${ID}"
          start: "0"
          rows: "10"
          filterField: ""
          filterQuery: ""
          sort: ""
          advanceField: ""
          advanceQuery: ""
          advance: "true"
        ) {
          data {
            ID
            name
            description
            status
            domain
            graphQlUrl
            restUrl
            createdAt
            updatedAt
          }
          pagination {
            total
            limit
            offset
          }
        }
      }
      pagination {
        total
        limit
        offset
      }
    }
  }`;
