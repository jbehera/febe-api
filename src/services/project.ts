import { httpClient } from '../utils/http-client';
import { FebeAPIConstants } from '../constants';
import { Project, ProjectCreateReq, ProjectUpdateReq } from '../schemas/project-schema';

export const projectService = {
  async getByQuery(query: string) {
    const { data } = await httpClient.get(
      FebeAPIConstants.PROJECT_BASE,
      Project.ListRes,
      {
        params: { query }
      }
    );
    return data;
  },

  async create(payload: ProjectCreateReq) {
    const { data } = await httpClient.post(
      FebeAPIConstants.PROJECT_BASE,
      payload,
      Project.ListItem
    );
    return data;
  },

  async update(payload: ProjectUpdateReq) {
    const { data } = await httpClient.put(
      FebeAPIConstants.PROJECT_BASE,
      payload,
      Project.ListItem
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
  }
};