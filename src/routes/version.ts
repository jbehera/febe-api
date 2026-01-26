import { Router } from 'express';
import validate from 'express-zod-safe';
import { z } from 'zod';
import { IdSchema, Version } from '../schemas';
import {
  getVersions,
  updateVersion,
  deleteVersion,
  getVersionById,
  publishVersion,
  saveVersion,
} from '../controllers/version-controller';

const router = Router();

// GET all versions for a project
router.get('/', validate({ query: Version.List }), getVersions);
router.get('/:id', validate({ params: { id: IdSchema } }), getVersionById);

// POST save version (replaces old addVersion)
router.post('/save', validate({ body: Version.Create }), saveVersion);

// POST publish version
router.post('/publish', validate({ body: Version.Publish }), publishVersion);

// PUT update version (for status and description changes primarily)
router.put('/', validate({ body: Version.Update }), updateVersion);

// DELETE version by ID
router.delete(
  '/:id',
  validate({ params: z.object({ id: IdSchema }) }),
  deleteVersion
);

export { router as versionRoutes };