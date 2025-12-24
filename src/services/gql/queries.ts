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
