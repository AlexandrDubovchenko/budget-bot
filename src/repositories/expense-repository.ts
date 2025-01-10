import { dbpool } from "@/db-client";
import { CategoryAnalytic } from "@/models/Analytic";
import { Expense } from "@/models/Expense";

const removeAllExpenseForTransaction = async (transaction_id: number) => {
  await dbpool.sql`DELETE FROM expense WHERE transaction_id = ${transaction_id}`
  return true
}

const createMultipleExpense = async ({ user_id, transaction_id, expenses, time }: { user_id: number, transaction_id: number, time: Date, expenses: Expense[] }) => {
  const values = expenses.map((_, index) => `($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${index * 5 + 4}, $${index * 5 + 5})`).join(', ')

  const { rows } = await dbpool.query(`
    INSERT INTO expense (user_id, time, amount, category, transaction_id) 
    VALUES ${values}`,
    expenses.map((expense) => [user_id, time, expense.amount, expense.category, transaction_id]).flat()
  )
  return rows
}

const updateExpense = async (id: string, payload: { category: string, amount: number }) => {
  const { rows } = await dbpool.sql`UPDATE expense SET amount = ${payload.amount}, category = ${payload.category} WHERE id = ${id}`
  return rows[0]
}

async function getUserExpensesGroupedByCategories(userId: number, from: number, to: number): Promise<CategoryAnalytic[]> {
  const result = await dbpool.sql<CategoryAnalytic>`
    SELECT 
      COALESCE(category, 'Без категории') AS category,
      COUNT(*)::INT AS transaction_count,
      SUM(amount)::DOUBLE PRECISION AS total_amount
    FROM 
      expense
    WHERE
      (category != 'Внутренний перевод' OR category IS NULL) AND
      user_id = ${userId} AND
      time BETWEEN TO_TIMESTAMP(${from}) AND TO_TIMESTAMP(${to})
    GROUP BY 
      category
    ORDER BY 
      category;
  `;
  return result.rows
}

export const expenseRepository = {
  removeAllExpenseForTransaction,
  createMultipleExpense,
  updateExpense,
  getUserExpensesGroupedByCategories
}
