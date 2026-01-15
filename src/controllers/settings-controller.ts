import { Request, Response } from 'express';
import { userSettingService } from '../services/user-settings-service';

export async function getUserSettings(req: Request, res: Response) {
  const { id } = req.params;
  const query = `ID:${id}`;
  const data = await userSettingService.getByQuery(query);
  return res.status(200).json(data);
}

export async function addUserSetting(req: Request, res: Response) {
  const data = await userSettingService.create(req.body);
  return res.status(201).json(data);
}

export async function updateUserSetting(req: Request, res: Response) {
  const data = await userSettingService.update(req.body);
  return res.status(200).json(data);
}

export async function deleteUserSetting(req: Request, res: Response) {
  const data = await userSettingService.remove(req.params.id);
  return res.status(200).json(data);
}