'use client';

import { action } from '@/actions/updateTransactionExpenses';
import { Expense } from '@/models/Expense';
import { Transaction } from '@/models/Transaction';
import { categoriesService } from '@/services/categories-service';
import classNames from 'classnames';
import {
  ChangeEvent,
  useMemo,
  useReducer,
  useState,
  useTransition,
} from 'react';
import z from 'zod';


const validateFormData = (data: unknown, maxAmount: number) => {
  const schema = z.object({
    transaction_id: z.number(),
    user_id: z.number(),
    time: z.date(),
    expenses: z
      .array(
        z.object({
          category: z.string().min(1),
          amount: z.number(),
        })
      )
      .nonempty()
      .refine(
        (expenses) =>
          expenses.reduce((sum, expense) => sum + expense.amount, 0) <=
          maxAmount,
        {
          message: `The total amount of expenses must not exceed ${(
            maxAmount / 100
          ).toFixed(2)}.`,
        }
      ),
  });

  return schema.safeParse(data);
};

enum ACTION_TYPES {
  CHANGE_MAIN_CATEGORY,
  ADD_EXTRA_EXPENSES,
  REMOVE_EXTRA_EXPENSES,
  CLEAR_EXTRA_EXPENSES,
  UPDATE_EXTRA_EXPENSE,
  RESET_STATE,
}

type ReducerState = {
  mainCategory?: string;
  extraExpenses: Partial<Expense>[];
};
type Action =
  | { type: ACTION_TYPES.ADD_EXTRA_EXPENSES; payload: string }
  | { type: ACTION_TYPES.CHANGE_MAIN_CATEGORY; payload?: string }
  | { type: ACTION_TYPES.CLEAR_EXTRA_EXPENSES }
  | { type: ACTION_TYPES.UPDATE_EXTRA_EXPENSE; payload: Partial<Expense> }
  | { type: ACTION_TYPES.REMOVE_EXTRA_EXPENSES; payload: string }
  | { type: ACTION_TYPES.RESET_STATE; payload: ReducerState };

const reducer = (state: ReducerState, action: Action) => {
  if (action.type === ACTION_TYPES.CHANGE_MAIN_CATEGORY) {
    return {
      ...state,
      mainCategory: action.payload,
      extraExpenses: [],
    };
  }

  if (action.type === ACTION_TYPES.ADD_EXTRA_EXPENSES) {
    return {
      ...state,
      extraExpenses: [
        ...state.extraExpenses,
        { category: action.payload, amount: undefined },
      ],
    };
  }

  if (action.type === ACTION_TYPES.REMOVE_EXTRA_EXPENSES) {
    return {
      ...state,
      extraExpenses: state.extraExpenses.filter(
        (expense) => expense.category !== action.payload
      ),
    };
  }

  if (action.type === ACTION_TYPES.CLEAR_EXTRA_EXPENSES) {
    return { ...state, extraExpenses: [] };
  }

  if (action.type === ACTION_TYPES.UPDATE_EXTRA_EXPENSE) {
    const currentExpenseIndex = state.extraExpenses.findIndex(
      (expense) => expense.category === action.payload.category
    );
    if (currentExpenseIndex !== -1) {
      state.extraExpenses[currentExpenseIndex] = action.payload;
      return { ...state, extraExpenses: [...state.extraExpenses] };
    } else {
      return state;
    }
  }

  if (action.type === ACTION_TYPES.RESET_STATE) {
    return action.payload;
  }

  return state;
};

const getInitialState = (transaction: Transaction): ReducerState => {
  const maxExpense = transaction.expenses.length
    ? transaction.expenses.reduce(
        (max, current) => (current.amount > max.amount ? current : max),
        transaction.expenses[0]
      )
    : undefined;

  return {
    mainCategory: maxExpense?.category,
    extraExpenses: transaction.expenses.filter(
      (expense) => expense !== maxExpense
    ),
  };
};

export const TransactionCard = ({
  transaction,
  forceExpanded,
  onSuccess,
}: {
  transaction: Transaction;
  forceExpanded?: boolean;
  onSuccess?: () => void;
}) => {
  const [transactionData, setTransactionData] = useState(transaction);
  const initialState = useMemo(
    () => getInitialState(transactionData),
    [transactionData]
  );
  const [isPending, startTransition] = useTransition();
  const [isCardExpanded, setCardExpanded] = useState(forceExpanded);
  const [expenseState, dispatch] = useReducer(reducer, initialState);
  const categories = categoriesService.getAllCategories() ?? [];

  const mainExpenseAmount = useMemo(() => {
    return Math.max(
      Math.abs(transactionData.amount) -
        expenseState.extraExpenses.reduce(
          (acc, expense) => (acc += expense.amount ?? 0),
          0
        ),
      0
    );
  }, [expenseState.extraExpenses, transactionData.amount]);

  const handleMainExpenseChange = (category: string) => {
    dispatch({
      type: ACTION_TYPES.CHANGE_MAIN_CATEGORY,
      payload: category || undefined,
    });
  };

  const toggleCardExpanded = () => {
    dispatch({ type: ACTION_TYPES.RESET_STATE, payload: initialState });
    setCardExpanded((prev) => !prev);
  };

  const handleCategoryClick = (category: string) => () => {
    if (
      expenseState.extraExpenses.find(
        (expense) => expense.category === category
      )
    ) {
      dispatch({ type: ACTION_TYPES.REMOVE_EXTRA_EXPENSES, payload: category });
    } else {
      dispatch({ type: ACTION_TYPES.ADD_EXTRA_EXPENSES, payload: category });
    }
  };

  const handleInputChange =
    (category: string) => (e: ChangeEvent<HTMLInputElement>) => {
      const currentExpenseIndex = expenseState.extraExpenses.findIndex(
        (expense) => expense.category === category
      );

      if (currentExpenseIndex !== -1) {
        const truncated = Math.floor(parseFloat(e.target.value) * 100) / 100;
        dispatch({
          type: ACTION_TYPES.UPDATE_EXTRA_EXPENSE,
          payload: {
            category,
            amount: e.target.value ? truncated * 100 : undefined,
          },
        });
      }
    };

  const createFormData = () => {
    const isExpense = transactionData.amount < 0;
    const multiplier = isExpense ? -1 : 1;
    return {
      transaction_id: transactionData.id,
      user_id: transactionData.user_id,
      time: new Date(transactionData.time),
      expenses: expenseState.mainCategory
        ? [
            {
              category: expenseState.mainCategory,
              amount: mainExpenseAmount * multiplier,
            },
            ...expenseState.extraExpenses
              .filter((expense) => expense.amount && expense.amount > 0)
              .map((expense) => ({
                ...expense,
                amount: (expense.amount ?? 0) * multiplier,
              })),
          ]
        : [],
    };
  };

  const onSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const data = createFormData();
    const validatedData = validateFormData(
      data,
      Math.abs(transactionData.amount)
    );
    if (validatedData.success) {
      startTransition(() => {
        action(validatedData.data).then((res) => {
          if (res.success) {
            setCardExpanded(false);
            setTransactionData(res.data);
            if (onSuccess) {
              onSuccess();
            }
          } else {
            console.log(res.error);
          }
        });
      });
    } else {
      console.log(validatedData.error);
    }
  };

  const validationResult = validateFormData(
    createFormData(),
    Math.abs(transactionData.amount)
  );

  return (
    <div
      onClick={toggleCardExpanded}
      className={classNames(
        'border-2 border-purple-500 bg-white p-3 rounded-md w-[350px]'
      )}
    >
      <header className='flex justify-between pb-2 mb-2 border-b border-black'>
        <h3 className='font-bold'>{transactionData.description}</h3>
        <span>{new Date(transactionData.time).toLocaleDateString()}</span>
      </header>
      <p>
        Сумма:{' '}
        <span className='italic font-bold'>
          {(transactionData.amount / 100).toFixed(2)} грн.
        </span>
      </p>
      {transactionData.comment && <p>Коммент: {transactionData.comment}</p>}
      {expenseState.mainCategory && (
        <div
          className={classNames('mt-4 grid grid-cols-2 gap-2', {
            hidden: isCardExpanded,
          })}
        >
          {transactionData.expenses.map(({ amount, category }) => (
            <div
              className='rounded-md text-white bg-purple-500 p-2'
              key={category}
            >
              {category}: {((amount ?? 0) / 100).toFixed(2)}
            </div>
          ))}
        </div>
      )}
      <div className={classNames({ hidden: !isCardExpanded })}>
        <div className='mt-4' onClick={(e) => e.stopPropagation()}>
          <select
            className='border w-full p-2 mb-4'
            value={expenseState.mainCategory}
            onChange={(e) => handleMainExpenseChange(e.target.value)}
          >
            <option value=''>Выберите категорию</option>
            {categories.map((category) => (
              <option value={category} key={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div
          onClick={(e) => e.stopPropagation()}
          className={classNames('mt-4', { hidden: !isCardExpanded })}
        >
          <p className='font-bold mb-2'>Дополнительные категории:</p>
          <div
            onClick={(e) => e.stopPropagation()}
            className='grid grid-cols-2 gap-2 mb-4'
          >
            {categories
              .filter((category) => category !== expenseState.mainCategory)
              .map((category) => {
                const currentExpense = expenseState.extraExpenses.find(
                  (expense) => expense.category === category
                );
                return (
                  <div key={category}>
                    <button
                      onClick={handleCategoryClick(category)}
                      className={classNames(
                        'p-2 rounded-t-sm w-full bg-slate-600 text-white text-sm',
                        {
                          'shadow-inner bg-slate-100 text-slate-800':
                            currentExpense,
                        }
                      )}
                    >
                      {category}
                    </button>
                    {currentExpense && (
                      <div className='p-2 flex gap-2 w-full border border-slate-800 rounded-b-sm'>
                        <input
                          onChange={handleInputChange(category)}
                          value={
                            currentExpense.amount
                              ? currentExpense.amount / 100
                              : undefined
                          }
                          className='min-w-0 outline-none'
                          type='number'
                        />
                        <span>грн</span>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
        <button
          disabled={isPending || !validationResult.success}
          onClick={onSubmit}
          className='bg-purple-500 w-full p-2 text-white hover:bg-purple-600 disabled:bg-purple-300'
        >
          Подтвердить
        </button>
        {!validationResult?.success && expenseState.mainCategory && (
          <p className='text-red-600'>
            {validationResult.error.issues[0].message}
          </p>
        )}
      </div>
    </div>
  );
};
