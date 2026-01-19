import { httpClient } from '../utils/http-client';
import { FebeAPIConstants } from '../constants';
import {
  Version,
  VersionCreateReq,
  VersionListReq,
  VersionUpdateReq,
} from '../schemas';

export const versionService = {
  async getByQuery(parsedQs: VersionListReq) {
    const { rows, start, projectId } = parsedQs;
    const query = `projectId:${projectId}`;
    const { data } = await httpClient.get(
      FebeAPIConstants.VERSION_BASE,
      Version.ListRes,
      {
        params: { query, rows, start },
      }
    );
    return data;
  },

  async getVersionById(id: string) {
    const { data } = await httpClient.get(
      FebeAPIConstants.VERSION_BASE,
      Version.ListRes,
      {
        params: { query: `ID:${id}` },
      }
    );

    return data?.data[0];
  },

  async create(payload: VersionCreateReq) {
    const { data } = await httpClient.post(
      FebeAPIConstants.VERSION_BASE,
      payload,
      Version.ListItemRes
    );
    return data;
  },

  async update(payload: VersionUpdateReq) {
    const { data } = await httpClient.put(
      FebeAPIConstants.VERSION_BASE,
      payload,
      Version.ListItemRes
    );
    return data;
  },

  async remove(id: string) {
    const { data } = await httpClient.delete(
      FebeAPIConstants.VERSION_BASE,
      Version.DeleteRes,
      { params: { query: `ID:${id}` } }
    );
    return data;
  },

  async publish() {
    

  }
};
