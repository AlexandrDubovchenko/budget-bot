import { expenseRepository } from "@/repositories/expense-repository";
import { transactionRepository } from "@/repositories/transaction-repository";

export const getAnalytic = async (userId: number, from: number, to: number) => {
  const analytic = await expenseRepository.getUserExpensesGroupedByCategories(
    userId,
    from / 1000,
    to / 1000,
  );
  const notMarkedTransactions =
    await transactionRepository.getUserNotMakedTransactions(
      userId,
      from / 1000,
      to / 1000,
    );

  return { analytic, notMarkedTransactions }
}
