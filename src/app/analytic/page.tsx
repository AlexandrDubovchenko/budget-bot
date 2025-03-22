import { MonthAnalyticChart } from '@/components/MonthAnalyticChart';
import { TransactionCard } from '@/components/TransactionCard';
import { expenseRepository } from '@/repositories/expense-repository';
import { transactionRepository } from '@/repositories/transaction-repository';
import { ServerComponentProps } from '@/types';
import { verifyJwt } from '@/utils/jwt';
import { urlWithParams } from '@/utils/url';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function Analytic({ searchParams }: ServerComponentProps) {
  const token = (await searchParams)?.token as string;
  if (!token) {
    return notFound();
  }
  const user = await verifyJwt<{ id: number }>(token);

  if (!user) {
    return notFound();
  }
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const fromTimestamp = Math.floor(startOfMonth.getTime() / 1000);
  const toTimestamp = Math.floor(now.getTime() / 1000);
  const analytic = await expenseRepository.getUserExpensesGroupedByCategories(
    user.id,
    fromTimestamp,
    toTimestamp
  );
  const notMarkedTransactions =
    await transactionRepository.getUserNotMakedTransactions(
      user.id,
      fromTimestamp,
      toTimestamp
    );

  if (!analytic) {
    return notFound();
  }

  return (
    <div className='p-6 bg-slate-800'>
      <header className='text-white mb-8'>
        <Link href={urlWithParams('/', { token })}>Home</Link>
      </header>
      <div className='flex flex-col gap-4'>
        <MonthAnalyticChart data={analytic} />
        <div className='flex flex-col gap-4'>
          {notMarkedTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onSuccess={() => revalidatePath('/analytic')}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
