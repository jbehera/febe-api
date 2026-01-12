import { Router } from 'express';
import validate from 'express-zod-safe';
import { z } from 'zod';
import { Env } from '../schemas';
import {
  addEnvironment,
  updateEnvironment,
  deleteEnvironment,
} from '../controllers/env-controller';

const router = Router();

router.post('/', validate({ body: Env.Create }), addEnvironment);
router.put('/', validate({ body: Env.Update }), updateEnvironment);
router.delete(
  '/:id',
  validate({ params: z.object({ id: z.uuid() }) }),
  deleteEnvironment
);

export { router as environmentRoutes };
