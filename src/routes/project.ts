import { Router } from 'express';
import validate from 'express-zod-safe';
import { z } from 'zod';
import { Project } from '../schemas/project-schema';
import {
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  getProjectsWithVersions,
  getProjectById,
} from '../controllers/project-controller';
import { IdSchema } from '../schemas';

const router = Router();

router.get('/', validate({query: Project.List}), getProjects);
router.get('/hierarchy', validate({ query: Project.List }), getProjectsWithVersions);
router.get('/:id', validate({ params: { id: IdSchema }}), getProjectById);

// POST create project
router.post('/', validate({ body: Project.Create }), addProject);

// PUT update project
router.put('/', validate({ body: Project.Update }), updateProject);

// DELETE project by ID
router.delete(
  '/:id',
  validate({ params: z.object({ id: z.uuid() }) }),
  deleteProject
);

export { router as projectRoutes };
