import { Request, Response } from 'express';
import { chatHistoryService } from '../services/chat-history-service';

export async function getChatHistoryByUserId(req: any, res: any) {
  const data = await chatHistoryService.getByUserId(req.query);
  return res.status(200).json(data);
}

export async function addChatHistory(req: Request, res: Response) {
  const data = await chatHistoryService.create(req.body);
  return res.status(201).json(data);
}

export async function deleteChatHistory(req: Request, res: Response) {
  const data = await chatHistoryService.remove(req.params.id);
  return res.status(200).json(data);
}
