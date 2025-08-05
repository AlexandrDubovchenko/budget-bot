import { Transaction } from '@/models/Transaction';

const getUserAccounts = async (apiKey: string) => {
  const userData = (await fetch(
    'https://api.monobank.ua/personal/client-info',
    {
      headers: {
        'X-Token': apiKey,
      },
    }
  ).then((res) => res.json())) as {
    accounts: { id: string; maskedPan: string }[];
  };

  if (!userData) {
    return [];
  }

  const { accounts } = userData;

  return accounts
    ?.filter((acc) => Boolean(acc.maskedPan?.length))
    .map(({ id }) => id);
};

const subscribeUserForUpdates = async (apiKey: string) => {
  const result = (await fetch('https://api.monobank.ua/personal/webhook', {
    headers: {
      'X-Token': apiKey,
    },
    body: JSON.stringify({
      webHookUrl: process.env.WEBHOOK_URL,
    }),
    method: 'POST',
  }).then((res) => res.json())) as {
    status: string;
    errorDescription?: string;
  };
  if (result.status !== 'ok') {
    throw new Error(result.errorDescription);
  } else {
    console.log(`SUBSCRIBED ${apiKey} on ${process.env.WEBHOOK_URL}`);
    return result;
  }
};

const shouldIgnoreTransaction = (transaction: Transaction) => {
  return ['На .', 'З гривневого рахунку ФОП'].includes(
    transaction.description ?? ''
  );
};

export const monobankService = {
  getUserAccounts,
  subscribeUserForUpdates,
  shouldIgnoreTransaction,
};
