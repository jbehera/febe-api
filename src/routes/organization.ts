import { z } from 'zod';
import express from 'express';
import validate from 'express-zod-safe';
import { getOrgHierarchy, updateOrganization } from '../controllers/organization-controller';
import { OrganizationUpdateSchema } from '../schemas';

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

router.put(
  '/',
  validate({
    body: OrganizationUpdateSchema
  }),
  updateOrganization
)

export { router as orgRoutes };
