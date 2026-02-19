import express from 'express';
const router = express.Router();

import { authRoutes } from "./auth";
import { settingsRoutes } from "./user-settings";
import { orgRoutes } from "./org";
import { environmentRoutes } from "./env";
import { subOrgRoutes } from './sub-org';
import { projectRoutes } from './project';
import { versionRoutes } from './version';
import { chatHistoryRoutes } from './chat-history';
import { configurationRoutes } from './configuration';
import { deploymentConfigurationRoutes } from './deployment-configuration';
import { deploymentRoutes } from './deployment';


router.use('/auth', authRoutes);
router.use('/settings', settingsRoutes);
router.use('/organization', orgRoutes);
router.use('/sub-organization', subOrgRoutes);
router.use('/environment', environmentRoutes);
router.use('/project', projectRoutes);
router.use('/version', versionRoutes);
router.use('/chat-history', chatHistoryRoutes);
router.use('/configuration', configurationRoutes);
router.use('/deployment-configuration', deploymentConfigurationRoutes);
router.use('/deployment', deploymentRoutes);

router.get('/health', (req, res) => {
  res.send('Health Ok!');
});

export { router as apiRoutes };