import { Router } from 'express';
import validate from 'express-zod-safe';
import { z } from 'zod';
import { ChatHistory } from '../schemas/chat-history-schema';
import {
  getChatHistoryByUserId,
  addChatHistory,
  deleteChatHistory,
} from '../controllers/chat-history-controller';
import { IdSchema } from '../schemas';

const router = Router();

// GET chat history by userId
router.get('/', validate({ query: ChatHistory.GetByUserId }), getChatHistoryByUserId);

// POST create chat history
router.post('/', validate({ body: ChatHistory.Create }), addChatHistory);

// DELETE chat history by ID
router.delete(
  '/:id',
  validate({ params: z.object({ id: z.uuid() }) }),
  deleteChatHistory
);

export { router as chatHistoryRoutes };
