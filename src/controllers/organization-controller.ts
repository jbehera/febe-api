import { Request, Response } from 'express';
import {
  getOrgAndSubOrgWithEnvironments,
} from '../services/organization';
import { getUserSettingsByQuery } from '../services/user-settings';

export async function getOrgHierarchy(req: Request, res: Response) {
  // get current user id after jwt decode

  const settingsId = req.params.settingsId;
  const settings = await getUserSettingsByQuery(`ID:${settingsId}`);
  const orgHierarchy = await getOrgAndSubOrgWithEnvironments({
    query: `ID:${settings?.orgId}`
  });

  return res.status(200).json(orgHierarchy);
}
