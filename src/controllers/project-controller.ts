import { Request, Response } from 'express';
import { projectService } from '../services/project-service';

export async function getProjectsWithVersions(req: any, res: any) {
  const data = await projectService.getProjectWithVersionsByQuery(req.query);
  return res.status(200).json(data);
}

export async function getProjects(req: any, res: any) {
  const data = await projectService.getByQuery(req.query);
  return res.status(200).json(data);
}

export async function getProjectById(req: Request, res: Response) {
  const data = await projectService.getProjectById(req.params.id);
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
