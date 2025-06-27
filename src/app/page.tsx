import { TransactionCard } from "@/components/TransactionCard";
import { transactionRepository } from "@/repositories/transaction-repository";
import { ServerComponentProps } from "@/types";
import { signJwt, verifyJwt } from "@/utils/jwt";
import { urlWithParams } from "@/utils/url";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
async function redirectIfDevMode() {
  if (process.env.NODE_ENV === "development") {
    const devToken = await signJwt({ id: 36 } as any);
    if (devToken) {
      return redirect(urlWithParams("/", { token: devToken }));
    }
  }
}
export default async function Home({ searchParams }: ServerComponentProps) {
  const token = (await searchParams)?.token as string;
  if (!token) {
    await redirectIfDevMode()
    return notFound()
  }
  const user = await verifyJwt<{ id: number }>(token as string);

  if (!user) {
    return notFound()
  }
  const transactions = await transactionRepository.getTransactionsByUserId(user.id);
  return (
    <div className="p-8">
      <header className="flex gap-2 mb-6 text-white">
        <Link href={urlWithParams('/', { token })}>Главная</Link>
        <Link href={urlWithParams('/analytic', { token })}>Аналитика</Link>
        <Link href={urlWithParams('/categories', { token })} className="ml-auto bg-purple-500 px-4 py-2 rounded text-white hover:bg-purple-600">Категории</Link>
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
