import { httpClient } from '../utils/http-client';
import { FebeAPIConstants } from '../constants';
import { SubOrg, SubOrgCreateReq, SubOrgUpdateReq } from '../schemas/sub-org-schema';

export const subOrgService = {
  async create(payload: SubOrgCreateReq) {
    const { data } = await httpClient.post(
      FebeAPIConstants.CREATE_SUB_ORG,
      payload,
      SubOrg.ItemRes
    );
    return data;
  },

  async update(payload: SubOrgUpdateReq) {
    const { data } = await httpClient.put(
      FebeAPIConstants.UPDATE_SUB_ORG,
      payload,
      SubOrg.ItemRes
    );
    return data;
  },

  async remove(id: string) {
    const { data } = await httpClient.delete(
      FebeAPIConstants.DELETE_SUB_ORG,
      SubOrg.DeleteRes,
      { params: { query: `ID:${id}` } }
    );
    return data;
  }
};