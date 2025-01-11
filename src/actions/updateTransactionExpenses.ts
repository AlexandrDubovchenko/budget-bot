"use server";
import z, { ZodError } from 'zod';
import { Expense } from "@/models/Expense";
import { expenseRepository } from "@/repositories/expense-repository";
import { transactionRepository } from '@/repositories/transaction-repository';
import { Transaction } from '@/models/Transaction';

const schema = z.object({
  transaction_id: z.number(),
  user_id: z.number(),
  time: z.date(),
  expenses: z.array(z.object({
    category: z.string().min(1),
    amount: z.number()
  })).nonempty()
})

export type FormData = {
  transaction_id: number;
  user_id: number;
  time: Date,
  expenses: Expense[]
};

export async function action(data: FormData): Promise<{ success: true, data: Transaction } | { success: false, error: string }> {
  try {
    const validatedData = schema.parse(data)
    const deleteResult = await expenseRepository.removeAllExpenseForTransaction(validatedData.transaction_id)
    if (deleteResult) await expenseRepository.createMultipleExpense(validatedData)
    const newTransactionData = await transactionRepository.getTransactionById(data.transaction_id)
    return { success: true, data: newTransactionData }
  } catch (error: unknown) {
    console.log(error);

    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0]?.message }
    } else {
      return { success: false, error: 'Something went wrong' }
    }
  }
}
