import { Request, Response } from 'express';
import { configurationService } from '../services/configuration-service';

export async function getConfigurations(req: any, res: any) {
  const data = await configurationService.getByQuery(req.query);
  return res.status(200).json(data);
}

export async function getConfigurationById(req: Request, res: Response) {
  const data = await configurationService.getById(req.params.id);
  return res.status(200).json(data);
}

export async function addConfiguration(req: Request, res: Response) {
  const data = await configurationService.create(req.body);
  return res.status(201).json(data);
}

export async function updateConfiguration(req: Request, res: Response) {
  const data = await configurationService.update(req.body);
  return res.status(200).json(data);
}

export async function deleteConfiguration(req: Request, res: Response) {
  const data = await configurationService.remove(req.params.id);
  return res.status(200).json(data);
}
