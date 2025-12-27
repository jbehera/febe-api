import { httpClient } from "../utils/http-client";
import { FebeAPIConstants } from "../constants";
import {
  EnvironmentCreateResponseSchema,
  EnvironmentCreateSchema,
} from "../schemas";

export async function createEnvironment(
  environmentPayload: any,
  token?: string
) {
  // if token is provided, include it in the headers
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const payload = EnvironmentCreateSchema.parse(environmentPayload);
  const response = await httpClient.post(
    FebeAPIConstants.CREATE_ENVIRONMENT,
    payload,
    EnvironmentCreateResponseSchema,
    {
      headers,
    }
  );

  return response.data;
}
