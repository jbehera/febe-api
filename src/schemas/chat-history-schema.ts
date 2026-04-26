import { z } from 'zod';
import { IdSchema, PaginatedCollection } from './common-schema';

/**
 * Abstracted core fields for ChatHistory
 */
export const ChatHistoryCore = {
  userId: IdSchema,
  projectId: IdSchema,
  role: z.string(),
  message: z.string(),
};

export const ChatHistory = {
  ListItemRes: z.object({
    response: z.object({
      ID: IdSchema,
      ...ChatHistoryCore,
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  }).transform((raw) => {
    const { ID, ...rest } = raw.response;
    return { id: ID, ...rest };
  }),

  ListRes: PaginatedCollection(
    z.object({
      ID: IdSchema,
      ...ChatHistoryCore,
      createdAt: z.string(),
      updatedAt: z.string(),
    }).transform(({ ID, ...rest }) => ({
      id: ID,
      ...rest,
    }))
  ),

  GetByUserId: z.object({
    userId: IdSchema,
    projectId: IdSchema,
    rows: z.coerce.number().int().min(1).default(10),
    start: z.coerce.number().int().min(0).default(0),
  }),

  Create: z.object(ChatHistoryCore),

  DeleteRes: z.object({
    responseMessage: z.string(),
  }).transform(data => ({
    message: data.responseMessage
  })),
};

export type ChatHistoryGetByUserIdReq = z.infer<typeof ChatHistory.GetByUserId>;
export type ChatHistoryCreateReq = z.infer<typeof ChatHistory.Create>;
