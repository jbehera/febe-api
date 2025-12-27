import { httpClient } from '../utils/http-client';
import { FebeAPIConstants } from '../constants';
import {
  SettingsCreateResponseSchema,
  SettingsCreateSchema,
  SettingsGetSchema,
} from '../schemas';

export async function getUserSettingsByQuery(query: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await httpClient.get(
    FebeAPIConstants.GET_USER_SETTINGS,
    SettingsGetSchema,
    {
      headers,
      params: { query },
    }
  );

  return response.data;
}

export async function createUserSettings(settingsPayload: any, token?: string) {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const payload = SettingsCreateSchema.parse(settingsPayload);
  const response = await httpClient.post(
    FebeAPIConstants.CREATE_USER_SETTINGS,
    payload,
    SettingsCreateResponseSchema,
    {
      headers,
    }
  );

  return response.data;
}
