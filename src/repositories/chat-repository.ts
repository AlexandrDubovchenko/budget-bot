import { dbpool } from "@/db-client";
import { Chat, CHAT_STATUS } from "@/models/Chat";

const createChat = async (id: number, status: CHAT_STATUS): Promise<Chat> => {
  const result = await dbpool.sql<Chat>`INSERT INTO chats (id, status) VALUES (${id}, ${status}) RETURNING id`
  return result.rows[0]
}

const getChatById = async (chatId: number): Promise<Chat> => {
  const result = await dbpool.sql<Chat>`SELECT * FROM chats
               WHERE id = ${chatId}`;
  return result.rows[0]
}

const updateStatus = async (chatId: number, status: CHAT_STATUS) => {
  return dbpool.sql<Chat>`UPDATE chats SET status = ${status}
               WHERE id = ${chatId}`;
}

export const chatRepository = {
  createChat,
  getChatById,
  updateStatus
}
