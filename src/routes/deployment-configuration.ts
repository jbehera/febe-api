import { Router } from 'express';
import validate from 'express-zod-safe';
import { z } from 'zod';
import { DeploymentConfiguration } from '../schemas/deployment-configuration-schema';
import {
  getDeploymentConfigurations,
  addDeploymentConfiguration,
  updateDeploymentConfiguration,
  deleteDeploymentConfiguration,
  getDeploymentConfigurationById,
} from '../controllers/deployment-configuration-controller';
import { IdSchema } from '../schemas';

const router = Router();

router.get('/', validate({query: DeploymentConfiguration.List}), getDeploymentConfigurations);
router.get('/:id', validate({ params: { id: IdSchema }}), getDeploymentConfigurationById);

// POST create deployment configuration
router.post('/', validate({ body: DeploymentConfiguration.Create }), addDeploymentConfiguration);

// PUT update deployment configuration
router.put('/', validate({ body: DeploymentConfiguration.Update }), updateDeploymentConfiguration);

// DELETE deployment configuration by ID
router.delete(
  '/:id',
  validate({ params: z.object({ id: z.uuid() }) }),
  deleteDeploymentConfiguration
);

export { router as deploymentConfigurationRoutes };
