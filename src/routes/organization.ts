import { z } from 'zod';
import express from 'express';
import validate from 'express-zod-safe';
import { getOrgHierarchy } from '../controllers/organization-controller';

const router = express.Router();

router.get(
  '/hierarchy/:settingsId',
  validate({
    params: {
      settingsId: z.uuid(),
    },
  }),
  getOrgHierarchy
);

export { router as orgRoutes };
