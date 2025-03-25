import { Analytic } from '@/components/Analytic';
import { getAnalytic } from '@/services/anayltic-service';
import { ServerComponentProps } from '@/types';
import { getCurrentMonthRange } from '@/utils/date';
import { verifyJwt } from '@/utils/jwt';
import { urlWithParams } from '@/utils/url';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function AnalyticPage({
  searchParams,
}: ServerComponentProps) {
  const token = (await searchParams)?.token as string;
  if (!token) {
    return notFound();
  }
  const user = await verifyJwt<{ id: number }>(token);

  if (!user) {
    return notFound();
  }
  const [fromTimestamp, toTimestamp] = getCurrentMonthRange();
  const { analytic, notMarkedTransactions } = await getAnalytic(
    user.id,
    fromTimestamp,
    toTimestamp
  );

  if (!analytic) {
    return notFound();
  }
  if (!analytic) {
    return notFound();
  }
  return (
    <div className='p-6 bg-slate-800'>
      <header className='text-white mb-8'>
        <Link href={urlWithParams('/', { token })}>Home</Link>
      </header>
      <div className='flex flex-col gap-4'>
        <Analytic initialData={{ analytic, notMarkedTransactions }} />
      </div>
    </div>
  );
}
