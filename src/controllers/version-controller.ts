import { Request, Response } from 'express';
import { versionService } from '../services/version-service';

export async function getVersions(req: any, res: Response) {
  // Uses any/Request because query types are validated by middleware
  const data = await versionService.getByQuery(req.query as any);
  return res.status(200).json(data);
}

export async function getVersionById(req: any, res: Response) {
  const data = await versionService.getVersionById(req.params.id);
  return res.status(200).json(data);
}

export async function addVersion(req: Request, res: Response) {
  const data = await versionService.create(req.body);
  return res.status(201).json(data);
}

export async function updateVersion(req: Request, res: Response) {
  const data = await versionService.update(req.body);
  return res.status(200).json(data);
}

export async function deleteVersion(req: Request, res: Response) {
  const data = await versionService.remove(req.params.id);
  return res.status(200).json(data);
}