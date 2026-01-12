import { Request, Response } from 'express';
import { environmentService } from '../services/environment';

export async function addEnvironment(req: Request, res: Response) {
  const data = await environmentService.create(req.body);
  
  return res.status(201).json(data);
}

export async function updateEnvironment(req: Request, res: Response) {
  const data = await environmentService.update(req.body);
  
  return res.status(200).json(data);
}

export async function deleteEnvironment(req: Request, res: Response) {
  const { id } = req.params;
  const data = await environmentService.remove(id);

  return res.status(200).json(data);
}