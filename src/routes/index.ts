import express from 'express';
const router = express.Router();

import { authRoutes } from "./auth";
import { settingsRoutes } from "./user-settings";
import { orgRoutes } from "./org";
import { environmentRoutes } from "./env";
import { subOrgRoutes } from './sub-org';
import { projectRoutes } from './project';


router.use('/auth', authRoutes);
router.use('/settings', settingsRoutes);
router.use('/organization', orgRoutes);
router.use('/sub-organization', subOrgRoutes);
router.use('/environment', environmentRoutes);
router.use('/project', projectRoutes);

export { router as apiRoutes };