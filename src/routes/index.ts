import express from 'express';
const router = express.Router();

import { authRoutes } from "./auth";
import { settingsRoutes } from "./user-settings";



router.use('/auth', authRoutes);
router.use('/settings', settingsRoutes);


export { router as apiRoutes };