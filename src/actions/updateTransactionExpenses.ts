"use server";
import z, { ZodError } from 'zod';
import { Expense } from "@/models/Expense";
import { expenseRepository } from "@/repositories/expense-repository";

const schema = z.object({
  transaction_id: z.number(),
  user_id: z.number(),
  time: z.date(),
  expenses: z.array(z.object({
    category: z.string().min(1),
    amount: z.number().gt(0)
  })).nonempty()
})

export type FormData = {
  transaction_id: number;
  user_id: number;
  time: Date,
  expenses: Expense[]
};

export async function action(data: FormData) {
  try {
    const validatedData = schema.parse(data)
    const deleteResult = await expenseRepository.removeAllExpenseForTransaction(validatedData.transaction_id)
    if (deleteResult) await expenseRepository.createMultipleExpense(validatedData)
    return { success: true }
  } catch (error: unknown) {
    console.log(error);

    if (error instanceof ZodError) {
      return { success: false, error: error.flatten }
    } else {
      return { success: false, error: 'Something went wrong' }
    }
  }
}
