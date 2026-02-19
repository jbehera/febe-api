import { Request, Response } from 'express';
import { deploymentService } from '../services/deployment-service';

export async function getDeployments(req: any, res: any) {
  const data = await deploymentService.getByQuery(req.query);
  return res.status(200).json(data);
}

export async function getDeploymentById(req: Request, res: Response) {
  const data = await deploymentService.getById(req.params.id);
  return res.status(200).json(data);
}

export async function addDeployment(req: Request, res: Response) {
  const data = await deploymentService.create(req.body);
  return res.status(201).json(data);
}

export async function updateDeployment(req: Request, res: Response) {
  const data = await deploymentService.update(req.body);
  return res.status(200).json(data);
}

export async function deleteDeployment(req: Request, res: Response) {
  const data = await deploymentService.remove(req.params.id);
  return res.status(200).json(data);
}
