import { z } from 'zod';

/**
 * 1. Define the internal User shape
 */
// const UserSchema = z.object({
//   id: z.string(),
//   email: z.email(),
//   firstName: z.string(),
//   middleName: z.string().optional().default(''),
//   lastName: z.string(),
//   settingsId: z.string().optional(),
// });

/**
 * 2. Define the External API Response & Transform it
 */
export const SignInResponseSchema = z
  .object({
    data: z.object({
      token: z.string(),
      ID: z.string(), // The uppercase ID from external API
      responseMessage: z.string(),
      responseType: z.string(),
      statusCode: z.number(),
    }),
  })
  .transform((raw) => ({
    token: raw.data.token,
    user: {
      id: raw.data.ID,
      email: '', // Placeholder, to be filled later
      firstName: '',
      middleName: '',
      lastName: '',
      settingsId: undefined,
    },
  }));

export const UserGetSchema = z
  .object({
    pagination: z.object({
      total: z.number(),
    }),
    data: z.array(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        middleName: z.string().nullable().optional(),
        email: z.email(),
        ID: z.string(), // External uppercase ID
        address: z.string(),
        role: z.string(),
        company: z.string(),
      })
    ),
  })
  .transform((val) => {
    const rawUser = val.data[0];

    if (!rawUser) {
      return null;
    }

    return {
      firstName: rawUser.firstName,
      lastName: rawUser.lastName,
      middleName: rawUser.middleName,
      email: rawUser.email,
      id: rawUser.ID, // Transformation: ID -> id
      address: rawUser.address,
      role: rawUser.role,
      company: rawUser.company,
    };
  });

export const CurrentUserGetSchema = z
  .object({
    data: z.object({
      email: z.email(),
      ID: z.string()
    })
  }).transform((val) => {
    return {
      email: val.data.email,
      id: val.data.ID
    }
  })


// TypeScript type inference
export type SignInResponse = z.infer<typeof SignInResponseSchema>;

/**
 * 3. Schema for the Request Payload (Optional but recommended)
 */
export const SignInRequestSchema = z.object({
  username: z.email(),
  password: z.string().min(8),
});

export const SignUpRequestSchema = z
  .object({
    email: z.email(),
    firstName: z.string().min(1, 'First name is required'),
    middleName: z.string().optional().nullable(),
    lastName: z.string().min(1, 'Last name is required'),
    address: z.string().min(1, 'Address is required'),
    company: z.string().min(1, 'Company is required'),
    role: z.string().default('user'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(8, 'Confirm Password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
  });

export const SignUpResponseSchema = z
  .object({
    data: z.object({
      responseMessage: z.string(),
      responseType: z.string(),
      activationCode: z.string(),
      statusCode: z.number(),
      ID: z.uuid(), 
    }),
  })
  .transform((raw) => ({
    id: raw.data.ID,
    activationCode: raw.data.activationCode,
    status: raw.data.statusCode,
  }));


/* 1. Request Schema
 * Validates the activation key sent from the frontend.
 */
export const ActivationRequestSchema = z.object({
  userActivationKey: z.string().min(1, "Activation key is required"),
});

/**
 * 2. External Response Schema & Transformation
 * Maps the nested "Message" object to a flat "message" key.
 */
export const ActivationResponseSchema = z
  .object({
    Message: z.object({
      responseMessage: z.string(),
      responseType: z.string(),
      statusCode: z.number(),
    }),
  })
  .transform((raw) => ({
    message: raw.Message.responseMessage,
  }));