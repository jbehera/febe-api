import { httpClient } from '../utils/http-client';
import { FebeAPIConstants } from '../constants';
import { Env, EnvUpdateReq, EnvCreateReq } from '../schemas';

export const environmentService = {
  async create(payload: EnvCreateReq, token?: string) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const { data } = await httpClient.post(
      FebeAPIConstants.CREATE_ENVIRONMENT,
      payload,
      Env.ItemRes,
      { headers }
    );
    return data;
  },

  async update(payload: EnvUpdateReq) {
    const { data } = await httpClient.put(
      FebeAPIConstants.UPDATE_ENVIRONMENT,
      payload,
      Env.ItemRes
    );
    return data;
  },

  async remove(id: string) {
    const { data } = await httpClient.delete(
      FebeAPIConstants.DELETE_ENVIRONMENT,
      Env.DeleteRes,
      { params: { query: `ID:${id}` } }
    );
    return data;
  }
};
