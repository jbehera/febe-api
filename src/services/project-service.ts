import { httpClient } from '../utils/http-client';
import { FebeAPIConstants } from '../constants';
import {
  Project,
  ProjectCreateReq,
  ProjectGql,
  ProjectListReq,
  ProjectUpdateReq,
} from '../schemas';
import { graphqlClient } from '../utils/graphql-client';
import { GET_PROJECT_WITH_VERSION_SUMMARY } from './gql/queries';

export const projectService = {
  async getProjectWithVersionsByQuery(parsedQs: ProjectListReq) {
    const { rows, start, envId } = parsedQs;
    const response = await graphqlClient.execute(
      GET_PROJECT_WITH_VERSION_SUMMARY,
      ProjectGql.Response,
      { query: `environmentId:${envId}`, limit: `${rows}`, offset: `${start}` }
    );

    return response.data;
  },
  async getByQuery(parsedQs: ProjectListReq) {
    const { rows, start, envId } = parsedQs;
    const query = `environmentId:${envId}`;
    const { data } = await httpClient.get(
      FebeAPIConstants.PROJECT_BASE,
      Project.ListRes,
      {
        params: { query, rows, start },
      }
    );
    return data;
  },
  async getProjectById(id: string) {
    const { data } = await httpClient.get(
      FebeAPIConstants.PROJECT_BASE,
      Project.ListRes,
      {
        params: { query: `ID:${id}` },
      }
    );

    return data?.data[0];
  },
  async create(payload: ProjectCreateReq) {
    const { data } = await httpClient.post(
      FebeAPIConstants.PROJECT_BASE,
      payload,
      Project.ListItemRes
    );
    return data;
  },

  async update(payload: ProjectUpdateReq) {
    const { data } = await httpClient.put(
      FebeAPIConstants.PROJECT_BASE,
      payload,
      Project.ListItemRes
    );
    return data;
  },

  async remove(id: string) {
    const { data } = await httpClient.delete(
      FebeAPIConstants.PROJECT_BASE,
      Project.DeleteRes,
      { params: { query: `ID:${id}` } }
    );
    return data;
  },
};
