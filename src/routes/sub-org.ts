import { Router } from 'express';
import validate from 'express-zod-safe';
import { z } from 'zod';
import { SubOrg } from '../schemas/sub-org-schema';
import {
  addSubOrg,
  updateSubOrg,
  deleteSubOrg,
} from '../controllers/sub-org-controller';

const router = Router();

router.post('/', validate({ body: SubOrg.Create }), addSubOrg);
router.put('/', validate({ body: SubOrg.Update }), updateSubOrg);
router.delete(
  '/:id',
  validate({ params: z.object({ id: z.uuid() }) }),
  deleteSubOrg
);

export { router as subOrgRoutes };
