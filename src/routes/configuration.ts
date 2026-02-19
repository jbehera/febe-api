import { Router } from 'express';
import validate from 'express-zod-safe';
import { z } from 'zod';
import { Configuration } from '../schemas/configuration-schema';
import {
  getConfigurations,
  addConfiguration,
  updateConfiguration,
  deleteConfiguration,
  getConfigurationById,
} from '../controllers/configuration-controller';
import { IdSchema } from '../schemas';

const router = Router();

router.get('/', validate({query: Configuration.List}), getConfigurations);
router.get('/:id', validate({ params: { id: IdSchema }}), getConfigurationById);

// POST create configuration
router.post('/', validate({ body: Configuration.Create }), addConfiguration);

// PUT update configuration
router.put('/', validate({ body: Configuration.Update }), updateConfiguration);

// DELETE configuration by ID
router.delete(
  '/:id',
  validate({ params: z.object({ id: z.uuid() }) }),
  deleteConfiguration
);

export { router as configurationRoutes };
