import { dbpool } from '@/db-client';
import { User } from '@/models/User';

const getUserByApiKey = async (apiKey: string): Promise<User> => {
  const { rows } = await dbpool.sql<User>`SELECT * FROM users WHERE api_key = ${apiKey}`;
  return rows[0]
}

async function createUser(apiKey: string, chatId: number, accounts: string[]) {
  const client = await dbpool.connect();
  try {
    await client.query('BEGIN');
    const { rows: userRows } = await client.sql`INSERT INTO users (api_key, chat_id) VALUES (${apiKey}, ${chatId}) RETURNING id`;

    await client.sql`UPDATE chats SET user_id = ${userRows[0].id} WHERE id = ${chatId}`;
    const values = accounts.map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`);

    await client.query(`
      INSERT INTO accounts (account_id, user_id) 
      VALUES ${values}`,
      accounts.map((accountId) => [accountId, userRows[0].id]).flat()
    )

    await client.query('COMMIT');
    return {
      id: userRows[0].id,
      chat_id: chatId,
      api_key: apiKey
    }
  } catch (error) {
    console.error("Transaction failed, rolling back:", error);
    await client.query("ROLLBACK");
    throw error
  } finally {
    client.release();
  }
}

async function getUserByAccountId(accountId: string): Promise<User> {
  const { rows } = await dbpool.sql<User>`SELECT u.*
      FROM users u
  JOIN accounts acc ON u.id = acc.user_id
  WHERE acc.account_id = ${accountId} `;
  return rows[0]
}

async function getUserByChatId(chatId: number): Promise<User> {
  const { rows } = await dbpool.sql<User>`SELECT * FROM users WHERE chat_id = ${chatId} `;
  return rows[0]
}

export const userRepository = {
  getUserByApiKey,
  createUser,
  getUserByAccountId,
  getUserByChatId
}
