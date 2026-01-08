import { Request, Response } from 'express';
import {
  activateNewUser,
  getCurrentUserByJWT,
  getUserById,
  signInUser,
  signUpUser,
} from '../services/auth';
import { enqueueEmail } from '../services/email/email-queue';
import { base64Encode } from '../utils/common';
import {
  createUserSettings,
  getUserSettingsByQuery,
} from '../services/user-settings';
import { assignOrgUser, createOrganization } from '../services/organization';
import { createEnvironment } from '../services/environment';
import { FebeEmailTemplates } from '../constants';

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

  const existingSettings = await getUserSettingsByQuery(
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

    const envResponse = await createEnvironment(
      {
        name: 'Sandbox',
        description: 'Sandbox',
        orgId: org.id,
        subOrgId: null,
      },
      token
    );

    const settingsPayload = {
      userId: user?.id!,
      orgId: org.id,
      subOrgId: null,
      environmentId: envResponse.id,
    };

    const userSettings = await createUserSettings(settingsPayload, token);
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
    middleName,
    password,
    address,
    company,
    role,
  } = req.body;

  const signUpResponse = await signUpUser({
    email,
    firstName,
    middleName,
    lastName,
    password,
    address,
    company,
    role,
  });

  const activationCode = base64Encode(
    `${signUpResponse.activationCode}+${email}`
  );
  const activationLink = `${process.env.FEBE_UI_APP_URL}/activate?code=${activationCode}`;

  await enqueueEmail({
    templateId: FebeEmailTemplates.ACCOUNT_ACTIVATION,
    to: [{ email: email, name: firstName + ' ' + lastName }],
    cc: [{ email: 'jayanitr2003@gmail.com', name: 'Jayachandra' }],
    mergeInfo: {
      companyName: 'Febe Cloud',
      activationLink: activationLink,
      supportEmail: 'support@febecloud.com',
      companyWebsite: 'https://febecloud.com',
      year: new Date().getFullYear().toString(),
    },
  });

  res.status(200).json(signUpResponse);
}

export async function activateUser(req: Request, res: Response) {
  const { code } = req.body;
  const payload = {
    userActivationKey: code as string,
  };

  // Call the activation endpoint
  const activationResponse = await activateNewUser(payload.userActivationKey);

  return res.status(200).json(activationResponse);
}

export async function currentUser(req: Request, res: Response) {
  const currentUserResponse = await getCurrentUserByJWT();
  return res.status(200).json(currentUserResponse);
}