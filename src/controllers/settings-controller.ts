import { Request, Response } from 'express';
import { getUserSettingsByQuery } from '../services/user-settings';

export async function getUserSettings(req: Request, res: Response) {
  const settingsId = req.params.id;
  const settings = await getUserSettingsByQuery(`ID:${settingsId}`);

  return res.status(200).json(settings);
}