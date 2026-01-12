import { Request, Response } from 'express';
import { projectService } from '../services/project';

export async function getProjects(req: Request, res: Response) {
  const envId = req.params.envId;
  const data = await projectService.getByQuery(`environmentId:${envId}`);
  return res.status(200).json(data);
}

export async function addProject(req: Request, res: Response) {
  const data = await projectService.create(req.body);
  return res.status(201).json(data);
}

export async function updateProject(req: Request, res: Response) {
  const data = await projectService.update(req.body);
  return res.status(200).json(data);
}

export async function deleteProject(req: Request, res: Response) {
  const data = await projectService.remove(req.params.id);
  return res.status(200).json(data);
}
