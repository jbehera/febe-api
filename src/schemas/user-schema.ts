import { z } from 'zod';

export const signInSchema = z.object({
  username: z.email(),
  password: z.string().min(8),
});

export const signUpSchema = z
  .object({
    email: z.email(),
    firstName: z.string().min(2),
    middleName: z.string().optional(),
    lastName: z.string().min(2),
    password: z.string().min(8),
    confirmPassword: z.string().min(8).optional(),
    address: z.string().min(10),
    company: z.string().min(2),
    role: z.string().min(2).default('user'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
  });

export const activateUserSchema = z.object({
  userActivationKey: z.uuid(),
});

export const authResponseSchema = z.object({
  token: z.string(),
  ID: z.string(),
});

export type SignInRequest = z.infer<typeof signInSchema>;
export type SignUpRequest = z.infer<typeof signUpSchema>;
export type ActivateUserRequest = z.infer<typeof activateUserSchema>;

export type AuthSuccessResponse = {
  responseMessage: string;
  responseType: string;
  statusCode: number;
} & { [key: string]: any };
