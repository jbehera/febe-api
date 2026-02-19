import { httpClient } from '../utils/http-client';
import { FebeAPIConstants } from '../constants';
import {
  ChatHistory,
  ChatHistoryCreateReq,
  ChatHistoryGetByUserIdReq,
} from '../schemas';

export const chatHistoryService = {
  async getByUserId(parsedQs: ChatHistoryGetByUserIdReq) {
    const { userId, projectId, rows, start } = parsedQs;
    const query = `userId:${userId} && projectId:${projectId}`;
    const { data } = await httpClient.get(
      FebeAPIConstants.CHAT_HISTORY_BASE,
      ChatHistory.ListRes,
      {
        params: { query, rows, start },
      }
    );
    return data;
  },

  async create(payload: ChatHistoryCreateReq) {
    const { data } = await httpClient.post(
      FebeAPIConstants.CHAT_HISTORY_BASE,
      payload,
      ChatHistory.ListItemRes
    );
    return data;
  },

  async remove(id: string) {
    const { data } = await httpClient.delete(
      FebeAPIConstants.CHAT_HISTORY_BASE,
      ChatHistory.DeleteRes,
      { params: { query: `ID:${id}` } }
    );
    return data;
  },
};
