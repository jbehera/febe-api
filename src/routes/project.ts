import { Router } from 'express';
import validate from 'express-zod-safe';
import { z } from 'zod';
import { Project } from '../schemas/project-schema';
import {
  getProjects,
  addProject,
  updateProject,
  deleteProject,
} from '../controllers/project-controller';

const router = Router();

// GET all projects
router.get(
  '/:envId',
  validate({ params: z.object({ envId: z.uuid() }) }),
  getProjects
);

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
