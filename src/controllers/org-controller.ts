import { Request, Response } from 'express';
import {
  getOrgAndSubOrgWithEnvironments,
  updateOrg,
} from '../services/org-service';
import { userSettingService } from '../services/user-settings-service';

export async function getOrgHierarchy(req: Request, res: Response) {
  // get current user id after jwt decode

  const settingsId = req.params.settingsId;
  const settings = await userSettingService.getByQuery(`ID:${settingsId}`);
  const orgHierarchy = await getOrgAndSubOrgWithEnvironments({
    query: `ID:${settings?.orgId}`
  });

  return res.status(200).json(orgHierarchy);
}

export async function updateOrganization(req: Request, res: Response) {
  const response = await updateOrg(req.body);
  return res.status(200).json(response);
}
