import { httpClient } from '../utils/http-client';
import { FebeAPIConstants } from '../constants';
import {
  UserSetting,
  UserSettingCreateReq,
  UserSettingListReq,
  UserSettingUpdateReq,
} from '../schemas';

export const userSettingService = {
  async getByQuery(query: string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const { data } = await httpClient.get(
      FebeAPIConstants.USER_SETTINGS_BASE,
      UserSetting.ListRes,
      {
        headers,
        params: { query },
      }
    );
    return data?.data?.[0];
  },

  async create(payload: UserSettingCreateReq, token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const { data } = await httpClient.post(
      FebeAPIConstants.USER_SETTINGS_BASE,
      payload,
      UserSetting.ListItemRes,
      { headers }
    );
    return data;
  },

  async update(payload: UserSettingUpdateReq) {
    const { data } = await httpClient.put(
      FebeAPIConstants.USER_SETTINGS_BASE,
      payload,
      UserSetting.ListItemRes
    );
    return data;
  },

  async remove(id: string) {
    const {
      data,
    } = await httpClient.delete(
      FebeAPIConstants.USER_SETTINGS_BASE,
      UserSetting.DeleteRes,
      { params: { query: `ID:${id}` } }
    );
    return data;
  },
};
