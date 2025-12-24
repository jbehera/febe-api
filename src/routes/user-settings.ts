import { z } from 'zod';
import express from 'express';
import validate from 'express-zod-safe';
import { getUserSettings } from '../controllers/settings-controller';

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

export { router as settingsRoutes };
