import { httpClient } from '../utils/http-client';
import {
  ActivationRequestSchema,
  ActivationResponseSchema,
  CurrentUserGetSchema,
  SignInRequestSchema,
  SignInResponseSchema,
  SignUpRequestSchema,
  SignUpResponseSchema,
  UserGetSchema,
} from '../schemas';
import { FebeAPIConstants } from '../constants';

export async function signInUser(username: string, password: string) {
  const payload = SignInRequestSchema.parse({ username, password });

  const apiResponse = await httpClient.post(
    FebeAPIConstants.SIGN_IN,
    payload,
    SignInResponseSchema
  );

  return apiResponse.data;
}

export async function signUpUser(signUpPayload: any) {
  const payload = SignUpRequestSchema.parse(signUpPayload);

  const response = await httpClient.post(
    FebeAPIConstants.SIGN_UP,
    payload,
    SignUpResponseSchema
  );
  
  return response.data;
}

export async function activateNewUser(activationCode: string) {
  const payload = ActivationRequestSchema.parse({ code: activationCode });

  const response = await httpClient.post(
    FebeAPIConstants.ACTIVATE_USER,
    payload,
    ActivationResponseSchema
  );

  return response.data;
}


export async function getUserById(userId: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await httpClient.get(
    FebeAPIConstants.GET_USER,
    UserGetSchema,
    {
      headers,
      params: { query: `ID:${userId}` },
    }
  );

  return response.data;
}

export async function getCurrentUserByJWT() {
  
  const response = await httpClient.get(
    FebeAPIConstants.GET_CURRENT_USER,
    CurrentUserGetSchema,
  );

  return response.data;
}