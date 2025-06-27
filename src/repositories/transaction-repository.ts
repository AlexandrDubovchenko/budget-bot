import { dbpool } from "@/db-client";
import { MonobankTransaction, Transaction } from "@/models/Transaction";

async function createTransaction(userId: number, transaction: MonobankTransaction): Promise<Transaction> {
  const { description, time, amount, comment = null, counterName = null } = transaction
  const result = await dbpool.sql<Transaction>`INSERT INTO transactions (user_id, time, description, amount, comment, counter_name) 
               VALUES (${userId}, TO_TIMESTAMP(${time}), ${description}, ${amount}, ${comment}, ${counterName})
               RETURNING id, time, description, amount, comment, counter_name`;

  return result.rows[0];
}

async function getTransactionsByUserId(userId: number): Promise<Transaction[]> {
  const result = await dbpool.sql<Transaction>`SELECT  
    t.id,
    t.description,
    t.user_id,
    t.time,
    t.comment,
    t.counter_name,
    t.amount,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT('id', e.id, 'amount', e.amount, 'category', e.category)
        ) FILTER (WHERE e.id IS NOT NULL), 
        '[]'
    ) AS expenses
    FROM transactions t
    LEFT JOIN expense e ON t.id = e.transaction_id
    WHERE t.user_id = ${userId}  
    GROUP BY t.id, t.user_id, t.time, t.description
    ORDER BY t.time DESC`;

  return result.rows;
}

async function getUserNotMakedTransactions(userId: number, from: number, to: number): Promise<Transaction[]> {
  const result = await dbpool.sql<Transaction>`SELECT  
    t.id,
    t.description,
    t.user_id,
    t.time,
    t.comment,
    t.counter_name,
    t.amount,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT('id', e.id, 'amount', e.amount, 'category', e.category)
        ) FILTER (WHERE e.id IS NOT NULL), 
        '[]'
    ) AS expenses
    FROM transactions t
    LEFT JOIN expense e ON t.id = e.transaction_id
    WHERE t.user_id = ${userId}
    AND e.id IS NULL
    AND t.time BETWEEN TO_TIMESTAMP(${from}) AND TO_TIMESTAMP(${to})
    GROUP BY t.id, t.user_id, t.time, t.description`

  return result.rows.map(row => ({
    ...row,
    time: new Date(row.time)  // Convert string to Date
  }));
}

async function getTransactionById(id: number): Promise<Transaction> {
  const result = await dbpool.sql<Transaction>`SELECT  
    t.id,
    t.description,
    t.user_id,
    t.time,
    t.comment,
    t.counter_name,
    t.amount,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT('id', e.id, 'amount', e.amount, 'category', e.category)
        ) FILTER (WHERE e.id IS NOT NULL), 
        '[]'
    ) AS expenses
    FROM transactions t
    LEFT JOIN expense e ON t.id = e.transaction_id
    WHERE t.id = ${id}  
    GROUP BY t.id, t.user_id, t.time, t.description`
  return result.rows[0]
}

export const transactionRepository = {
  createTransaction,
  getTransactionsByUserId,
  getUserNotMakedTransactions,
  getTransactionById
}
