import { TransactionCard } from "@/components/TransactionCard";
import { transactionRepository } from "@/repositories/transaction-repository";
import { ServerComponentProps } from "@/types";
import { verifyJwt } from "@/utils/jwt";
import { urlWithParams } from "@/utils/url";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Transaction({ params, searchParams }: ServerComponentProps) {
  const slug = (await params).slug
  const token = (await searchParams)?.token as string
  if (!token) {
    return notFound()
  }

  const user = await verifyJwt<{ id: number }>(token);

  if (!user) {
    return notFound()
  }

  const transaction = await transactionRepository.getTransactionById(Number(slug));

  if (!transaction) {
    return notFound()
  }

  return (
    <div className="p-8 bg-slate-800">
      <header className="flex text-white gap-2 mb-6">
        <Link href={urlWithParams('/', { token })}>Главная</Link>
        <Link href={urlWithParams('/analytic', {token})}>Аналитика</Link>
      </header>
      <div className="p-8 flex flex-col items-center gap-4">
        <div>
          <TransactionCard forceExpanded transaction={transaction}></TransactionCard>
        </div>
      </div>
    </div>
  );
}
