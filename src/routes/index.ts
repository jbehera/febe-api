import express from 'express';
const router = express.Router();

import { authRoutes } from "./auth";
import { settingsRoutes } from "./user-settings";
import { orgRoutes } from "./organization";
import { environmentRoutes } from "./environment";
import { subOrgRoutes } from './sub-organization';


router.use('/auth', authRoutes);
router.use('/settings', settingsRoutes);
router.use('/organization', orgRoutes);
router.use('/environment', environmentRoutes);
router.use('/sub-organization', subOrgRoutes);


export { router as apiRoutes };