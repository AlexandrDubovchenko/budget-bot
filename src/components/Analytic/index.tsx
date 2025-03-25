'use client';

import { CategoryAnalytic } from '@/models/Analytic';
import { Transaction } from '@/models/Transaction';
import { MonthAnalyticChart } from '../MonthAnalyticChart';
import { useState } from 'react';
import { TransactionCard } from '../TransactionCard';
import { useSearchParams } from 'next/navigation';
import { DatePicker } from '../DatePicker';
import { getCurrentMonthRange } from '@/utils/date';
import { urlWithParams } from '@/utils/url';

export const Analytic = ({
  initialData,
}: {
  initialData: {
    analytic: CategoryAnalytic[];
    notMarkedTransactions: Transaction[];
  };
}) => {
  const query = useSearchParams();
  const [selectedDateRange, setSelectedDateRange] = useState<[number, number]>(
    getCurrentMonthRange()
  );
  const [notMarkedTransactions, setNotMarkedTransactions] = useState(
    initialData.notMarkedTransactions
  );
  const [analytic, setAnalytic] = useState(initialData.analytic);

  const refetchAnalytic = async (range: [number, number]) => {
    const token = query.get('token');
    if (!token) {
      return;
    }
    const response = await fetch(
      urlWithParams('/api/analytic', {
        from: range[0].toString(),
        to: range[1].toString(),
      }),
      {
        headers: {
          Authorization: token,
        },
      }
    );
    return response.json();
  };

  const handleDateChange = async (dateRange: [number, number]) => {
    setSelectedDateRange(dateRange);
    const newAnalytic = await refetchAnalytic(dateRange);
    setAnalytic(newAnalytic.analytic);
    setNotMarkedTransactions(newAnalytic.notMarkedTransactions);
  };

  const onTransactionUpdated = async () => {
    const { analytic } = await refetchAnalytic(selectedDateRange);
    setAnalytic(analytic);
  };

  return (
    <div className='flex flex-col gap-4'>
      <DatePicker value={selectedDateRange} onChange={handleDateChange} />
      <MonthAnalyticChart data={analytic} />
      <div className='flex flex-col gap-4'>
        {notMarkedTransactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            onSuccess={onTransactionUpdated}
          />
        ))}
      </div>
    </div>
  );
};
