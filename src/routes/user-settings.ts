import { z } from 'zod';
import express from 'express';
import validate from 'express-zod-safe';
import {
  getUserSettings,
  updateUserSetting,
} from '../controllers/settings-controller';
import { UserSetting } from '../schemas';

const router = express.Router();

router.get(
  '/:id',
  validate({
    params: {
      id: z.uuid(),
    },
  }),
  getUserSettings
);
router.put(
  '/',
  validate({
    body: UserSetting.Update,
  }),
  updateUserSetting
);

export { router as settingsRoutes };
