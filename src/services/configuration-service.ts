import { httpClient } from '../utils/http-client';
import { FebeAPIConstants } from '../constants';
import {
  Configuration,
  ConfigurationCreateReq,
  ConfigurationListReq,
  ConfigurationUpdateReq,
} from '../schemas';

export const configurationService = {
  async getByQuery(parsedQs: ConfigurationListReq) {
    const { rows, start } = parsedQs;
    const { data } = await httpClient.get(
      FebeAPIConstants.CONFIGURATION_BASE,
      Configuration.ListRes,
      {     
        params: { query: "*:*", rows, start },
      }
    );
    return data;
  },
  async getById(id: string) {
    const { data } = await httpClient.get(
      FebeAPIConstants.CONFIGURATION_BASE,
      Configuration.ListRes,
      {
        params: { query: `ID:${id}` },
      }
    );

    return data?.data[0];
  },
  async create(payload: ConfigurationCreateReq) {
    const { data } = await httpClient.post(
      FebeAPIConstants.CONFIGURATION_BASE,
      payload,
      Configuration.ListItemRes
    );
    return data;
  },

  async update(payload: ConfigurationUpdateReq) {
    const { data } = await httpClient.put(
      FebeAPIConstants.CONFIGURATION_BASE,
      payload,
      Configuration.ListItemRes
    );
    return data;
  },

  async remove(id: string) {
    const { data } = await httpClient.delete(
      FebeAPIConstants.CONFIGURATION_BASE,
      Configuration.DeleteRes,
      { params: { query: `ID:${id}` } }
    );
    return data;
  },
};
