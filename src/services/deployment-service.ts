import { httpClient } from '../utils/http-client';
import { FebeAPIConstants } from '../constants';
import {
  Deployment,
  DeploymentCreateReq,
  DeploymentListReq,
  DeploymentUpdateReq,
} from '../schemas';

export const deploymentService = {
  async getByQuery(parsedQs: DeploymentListReq) {
    const { rows, start } = parsedQs;
    const { data } = await httpClient.get(
      FebeAPIConstants.DEPLOYMENT_BASE,
      Deployment.ListRes,
      {
        params: { rows, start },
      }
    );
    return data;
  },
  async getById(id: string) {
    const { data } = await httpClient.get(
      FebeAPIConstants.DEPLOYMENT_BASE,
      Deployment.ListRes,
      {
        params: { query: `ID:${id}` },
      }
    );

    return data?.data[0];
  },
  async create(payload: DeploymentCreateReq) {
    const { data } = await httpClient.post(
      FebeAPIConstants.DEPLOYMENT_BASE,
      payload,
      Deployment.ListItemRes
    );
    return data;
  },

  async update(payload: DeploymentUpdateReq) {
    const { data } = await httpClient.put(
      FebeAPIConstants.DEPLOYMENT_BASE,
      payload,
      Deployment.ListItemRes
    );
    return data;
  },

  async remove(id: string) {
    const { data } = await httpClient.delete(
      FebeAPIConstants.DEPLOYMENT_BASE,
      Deployment.DeleteRes,
      { params: { query: `ID:${id}` } }
    );
    return data;
  },
};
