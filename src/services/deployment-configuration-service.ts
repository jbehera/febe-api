import { httpClient } from '../utils/http-client';
import { FebeAPIConstants } from '../constants';
import {
  DeploymentConfiguration,
  DeploymentConfigurationCreateReq,
  DeploymentConfigurationListReq,
  DeploymentConfigurationUpdateReq,
} from '../schemas';

export const deploymentConfigurationService = {
  async getByQuery(parsedQs: DeploymentConfigurationListReq) {
    const { rows, start } = parsedQs;
    const { data } = await httpClient.get(
      FebeAPIConstants.DEPLOYMENT_CONFIGURATION_BASE,
      DeploymentConfiguration.ListRes,
      {
        params: { rows, start },
      }
    );
    return data;
  },
  async getById(id: string) {
    const { data } = await httpClient.get(
      FebeAPIConstants.DEPLOYMENT_CONFIGURATION_BASE,
      DeploymentConfiguration.ListRes,
      {
        params: { query: `ID:${id}` },
      }
    );

    return data?.data[0];
  },
  async create(payload: DeploymentConfigurationCreateReq) {
    const { data } = await httpClient.post(
      FebeAPIConstants.DEPLOYMENT_CONFIGURATION_BASE,
      payload,
      DeploymentConfiguration.ListItemRes
    );
    return data;
  },

  async update(payload: DeploymentConfigurationUpdateReq) {
    const { data } = await httpClient.put(
      FebeAPIConstants.DEPLOYMENT_CONFIGURATION_BASE,
      payload,
      DeploymentConfiguration.ListItemRes
    );
    return data;
  },

  async remove(id: string) {
    const { data } = await httpClient.delete(
      FebeAPIConstants.DEPLOYMENT_CONFIGURATION_BASE,
      DeploymentConfiguration.DeleteRes,
      { params: { query: `ID:${id}` } }
    );
    return data;
  },
};
