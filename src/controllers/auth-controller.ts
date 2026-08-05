import { Request, Response } from 'express';
import {
  activateNewUser,
  getCurrentUserByJWT,
  getUserById,
  signInUser,
  signUpUser,
} from '../services/auth-service';
import { enqueueEmail } from '../services/email/email-queue';
import { base64Encode } from '../utils/common';
import {
  userSettingService
} from '../services/user-settings-service';
import { assignOrgUser, createOrganization } from '../services/org-service';
import { environmentService } from '../services/env-service';
import { FebeEmailTemplates } from '../constants';
import { EnvCreateReq } from '../schemas';

export async function signIn(req: Request, res: Response) {
  const { username, password } = req.body;

  const apiResponse = await signInUser(username, password);

  const { token, user } = apiResponse;

  const febeUser = await getUserById(user?.id!, token);

  if (user && febeUser) {
    user.email = febeUser.email;
    user.firstName = febeUser.firstName;
    user.middleName = febeUser.middleName as string;
    user.lastName = febeUser.lastName;
  }

  const existingSettings = await userSettingService.getByQuery(
    `userId:${user?.id}`,
    token
  );

  let settingsId = '';
  if (existingSettings) {
    settingsId = existingSettings.id;
  } else {
    // No settings found, create default settings
    const org = await createOrganization(
      { name: 'Master Org', description: 'Default Organization' },
      token
    );

    await assignOrgUser(org.id, user?.id!, token);

    const newEnv: EnvCreateReq = {
      name: 'Sandbox',
      description: 'Sandbox',
      orgId: org.id,
      subOrgId: null,
    };

    const envResponse = await environmentService.create(newEnv, token);

    const settingsPayload = {
      userId: user?.id!,
      orgId: org.id,
      subOrgId: null,
      environmentId: envResponse.id,
    };

    const userSettings = await userSettingService.create(settingsPayload, token);
    settingsId = userSettings.id;
  }

  (user as any).settingsId = settingsId;

  return res.status(200).json({ token, user });
}

export async function signUp(req: Request, res: Response) {
  const {
    email,
    firstName,
    lastName,
    password,
    company,
    role,
  } = req.body;

  const signUpResponse = await signUpUser({
    email,
    firstName,
    lastName,
    password,
    company,
    role,
  });

  const activationCode = base64Encode(
    `${signUpResponse.activationCode}+${email}`
  );
  const activationLink = `${process.env.FEBE_UI_APP_URL}/activate?code=${activationCode}`;

  // Send email asynchronously - don't block signup response
  // enqueueEmail({
  //   templateId: FebeEmailTemplates.ACCOUNT_ACTIVATION,
  //   to: [{ email: email, name: firstName + ' ' + lastName }],
  //   cc: [{ email: 'jayanitr2003@gmail.com', name: 'Jayachandra' }],
  //   mergeInfo: {
  //     companyName: 'Febe Cloud',
  //     activationLink: activationLink,
  //     supportEmail: 'support@febecloud.com',
  //     companyWebsite: 'https://febecloud.com',
  //     year: new Date().getFullYear().toString(),
  //   },
  // }).catch((error) => {
  //   console.log("🚀 ~ signUp ~ error:", error)
  //   // logger.error('Failed to send activation email', {
  //   //   email,
  //   //   error: error.message,
  //   // });
  // });

  res.status(200).json(signUpResponse);
}

export async function activateUser(req: Request, res: Response) {
  const { userActivationKey } = req.body;

  const activationResponse = await activateNewUser(userActivationKey);

  return res.status(200).json(activationResponse);
}

export async function currentUser(req: Request, res: Response) {
  const currentUserResponse = await getCurrentUserByJWT();
  return res.status(200).json(currentUserResponse);
}
