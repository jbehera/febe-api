import { Request, Response } from 'express';
import { deploymentConfigurationService } from '../services/deployment-configuration-service';

export async function getDeploymentConfigurations(req: any, res: any) {
  const data = await deploymentConfigurationService.getByQuery(req.query);
  return res.status(200).json(data);
}

export async function getDeploymentConfigurationById(req: Request, res: Response) {
  const data = await deploymentConfigurationService.getById(req.params.id);
  return res.status(200).json(data);
}

export async function addDeploymentConfiguration(req: Request, res: Response) {
  const data = await deploymentConfigurationService.create(req.body);
  return res.status(201).json(data);
}

export async function updateDeploymentConfiguration(req: Request, res: Response) {
  const data = await deploymentConfigurationService.update(req.body);
  return res.status(200).json(data);
}

export async function deleteDeploymentConfiguration(req: Request, res: Response) {
  const data = await deploymentConfigurationService.remove(req.params.id);
  return res.status(200).json(data);
}
