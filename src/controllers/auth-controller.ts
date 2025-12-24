import { Request, Response } from 'express';
import { httpClient } from '../utils/http-client';
import {
  SignInRequest,
  AuthSuccessResponse,
  SignUpRequest,
  ActivateUserRequest,
  authResponseSchema,
  signInSchema
} from '../schemas';
import { FebeAPIConstants, FebeEmailTemplates } from '../constants';
import { enqueueEmail } from '../services/email/email-queue';
import { base64Encode } from '../utils/common';

async function signIn(req: Request, res: Response) {
  const { username, password } = req.body;

  const payload: SignInRequest = { username, password };

  const signInResponse = await httpClient.post<signInSchema>(FebeAPIConstants.SIGN_IN, payload, authResponseSchema);

  const { token, ID: userId } = signInResponse?.data?.data;

  // Check if settings exist, else create default settings
  const userSettingsResponse = await httpClient.get<any>(
    `${FebeAPIConstants.GET_USER_SETTINGS}?query=userId:${userId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  let settingsId = '';

  if (
    !userSettingsResponse?.data?.data ||
    userSettingsResponse?.data?.data?.length === 0
  ) {
    // Create default org (Master Org)
    const orgResponse = await httpClient.post<any, any>(
      FebeAPIConstants.CREATE_ORGANIZATION,
      { name: 'Master Org', description: 'Default Organization' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const orgId = orgResponse?.data?.response?.ID;

    // Assign the orgId to the user in userOrg mapping
    await httpClient.post<any, any>(
      FebeAPIConstants.CREATE_USER_ORG_MAPPING,
      { userId: userId, orgId: orgId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Create default environment under the Org
    const envResponse = await httpClient.post<any, any>(
      FebeAPIConstants.CREATE_ENVIRONMENT,
      { name: 'Sandbox', description: 'Sandbox', orgId: orgId, subOrgId: null },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const environmentId = envResponse?.data?.response?.ID;

    const settingsPayload = {
      userId: userId,
      orgId: orgId,
      subOrgId: null,
      environmentId: environmentId,
    };

    // Create default settings for the user passing the userId, orgId, environmentId
    const userSetting = await httpClient.post<any, any>(
      FebeAPIConstants.CREATE_USER_SETTINGS,
      settingsPayload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    settingsId = userSetting?.data?.response?.ID;
  } else {
    settingsId = userSettingsResponse?.data?.data?.[0]?.ID;
  }

  const userResponse = await httpClient.get<any>(
    `${FebeAPIConstants.GET_USER}?query=ID:${userId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const {
    email,
    firstName,
    middleName,
    lastName,
  } = userResponse?.data?.data?.[0];

  return res.status(200).json({
    token: token as string,
    user: {
      id: userId as string,
      email: email,
      firstName: firstName,
      middleName: middleName || '',
      lastName: lastName,
      settingsId: settingsId,
    },
  });
}

async function signUp(req: Request, res: Response) {
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

  const payload: SignUpRequest = {
    email,
    firstName,
    lastName,
    middleName,
    password,
    address,
    company,
    role,
  };
  const signUpResponse = await httpClient.post<
    AuthSuccessResponse,
    SignUpRequest
  >(FebeAPIConstants.SIGN_UP, payload);
  const activationCode = base64Encode(
    `${signUpResponse?.data?.data?.activationCode}+${email}`
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

async function activateUser(req: Request, res: Response) {
  const { code } = req.body;
  const payload: ActivateUserRequest = {
    userActivationKey: code as string,
  };

  // Call the activation endpoint
  const activationResponse = await httpClient.post<
    AuthSuccessResponse,
    ActivateUserRequest
  >(FebeAPIConstants.ACTIVATE_USER, payload);

  return res.status(200).json(activationResponse.data);
}

export { signIn, signUp, activateUser };
