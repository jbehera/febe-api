import { Router } from 'express';
import validate from 'express-zod-safe';
import { z } from 'zod';
import { IdSchema, Version } from '../schemas';
import {
  getVersions,
  addVersion,
  updateVersion,
  deleteVersion,
  getVersionById,
} from '../controllers/version-controller';

const router = Router();

// GET all versions for a project
router.get('/', validate({ query: Version.List }), getVersions);
router.get('/:id', validate({ params: { id: IdSchema } }), getVersionById);

// POST create version
router.post('/', validate({ body: Version.Create }), addVersion);

// PUT update version
router.put('/', validate({ body: Version.Update }), updateVersion);

// DELETE version by ID
router.delete(
  '/:id',
  validate({ params: z.object({ id: z.string().uuid() }) }),
  deleteVersion
);

export { router as versionRoutes };