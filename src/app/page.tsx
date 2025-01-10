import { TransactionCard } from "@/components/TransactionCard";
import { transactionRepository } from "@/repositories/transaction-repository";
import { ServerComponentProps } from "@/types";
import { verifyJwt } from "@/utils/jwt";
import { urlWithParams } from "@/utils/url";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Home({ searchParams }: ServerComponentProps) {
  const token = (await searchParams)?.token as string;
  if (!token) {
    return notFound()
  }
  const user = await verifyJwt<{ id: number }>(token as string);

  if (!user) {
    return notFound()
  }
  const transactions = await transactionRepository.getTransactionsByUserId(user.id);
  return (
    <div className="p-8">
      <header className="flex text-white gap-2 mb-6">
        <Link href={urlWithParams('/', { token })}>Главная</Link>
        <Link href={urlWithParams('/analytic', { token })}>Аналитика</Link>
      </header>
      <div className="flex flex-col items-center gap-4">
        {transactions.map((transaction) => (
          <div key={transaction.id}>
            <TransactionCard transaction={transaction}></TransactionCard>
          </div>
        ))}
      </div>
    </div>
  );

}
