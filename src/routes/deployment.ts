import { Router } from 'express';
import validate from 'express-zod-safe';
import { z } from 'zod';
import { Deployment } from '../schemas/deployment-schema';
import {
  getDeployments,
  addDeployment,
  updateDeployment,
  deleteDeployment,
  getDeploymentById,
} from '../controllers/deployment-controller';
import { IdSchema } from '../schemas';

const router = Router();

router.get('/', validate({query: Deployment.List}), getDeployments);
router.get('/:id', validate({ params: { id: IdSchema }}), getDeploymentById);

// POST create deployment
router.post('/', validate({ body: Deployment.Create }), addDeployment);

// PUT update deployment
router.put('/', validate({ body: Deployment.Update }), updateDeployment);

// DELETE deployment by ID
router.delete(
  '/:id',
  validate({ params: z.object({ id: z.uuid() }) }),
  deleteDeployment
);

export { router as deploymentRoutes };
