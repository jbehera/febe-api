import { Request, Response } from 'express';
import { FebeAPIConstants } from '../constants/api-constants';
import { httpClient } from '../utils/http-client';

async function getUserSettings(req: Request, res: Response) {
  const settingsId = req.params.id;
  const userSettingsResponse = await httpClient.get<any>(
    `${FebeAPIConstants.GET_USER_SETTINGS}?query=ID:${settingsId}`,
  );

  return res.status(200).json(userSettingsResponse.data);
}

export { getUserSettings };