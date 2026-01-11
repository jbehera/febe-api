import { Request, Response } from 'express';
import { subOrgService } from '../services/sub-organization';

export async function addSubOrg(req: Request, res: Response) {
  const data = await subOrgService.create(req.body);
  return res.status(201).json(data);
}

export async function updateSubOrg(req: Request, res: Response) {
  const data = await subOrgService.update(req.body);
  return res.status(200).json(data);
}

export async function deleteSubOrg(req: Request, res: Response) {
  const data = await subOrgService.remove(req.params.id);
  return res.status(200).json(data);
}