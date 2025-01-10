'use client'

import { action } from "@/actions/updateTransactionExpenses"
import { Expense } from "@/models/Expense"
import { Transaction } from "@/models/Transaction"
import classNames from "classnames"
import { ChangeEvent, useMemo, useReducer, useState, useTransition } from "react"
import z from 'zod'

export const categories = [
  "Развлечения",
  "Транспорт",
  "Продукты",
  "Доставка еды",
  "Товары для дома",
  "Техника",
  "Подарки",
  "Внутренний перевод",
  "Выпивка",
  "Табак",
  "Ресторан",
  "Кофе",
  "Другое"
]

const validateFormData = (data: unknown, maxAmount: number) => {
  const schema = z.object({
    transaction_id: z.number(),
    user_id: z.number(),
    time: z.date(),
    expenses: z.array(z.object({
      category: z.string().min(1),
      amount: z.number().gt(0)
    })).nonempty()
      .refine(
        (expenses) => expenses.reduce((sum, expense) => sum + expense.amount, 0) <= maxAmount,
        {
          message: `The total amount of expenses must not exceed ${(maxAmount / 100).toFixed(2)}.`,
        }
      )
  })

  return schema.safeParse(data)
}

enum ACTION_TYPES {
  CHANGE_MAIN_CATEGORY,
  ADD_EXTRA_EXPENSES,
  REMOVE_EXTRA_EXPENSES,
  CLEAR_EXTRA_EXPENSES,
  UPDATE_EXTRA_EXPENSE,
}

type ReducerState = { mainCategory?: string, extraExpenses: Partial<Expense>[] }
type Action = { type: ACTION_TYPES.ADD_EXTRA_EXPENSES, payload: string }
  | { type: ACTION_TYPES.CHANGE_MAIN_CATEGORY, payload?: string }
  | { type: ACTION_TYPES.CLEAR_EXTRA_EXPENSES }
  | { type: ACTION_TYPES.UPDATE_EXTRA_EXPENSE, payload: Partial<Expense> }
  | { type: ACTION_TYPES.REMOVE_EXTRA_EXPENSES, payload: string }

const reducer = (state: ReducerState, action: Action) => {
  if (action.type === ACTION_TYPES.CHANGE_MAIN_CATEGORY) {
    return {
      ...state,
      mainCategory: action.payload,
      extraExpenses: []
    }
  }

  if (action.type === ACTION_TYPES.ADD_EXTRA_EXPENSES) {
    return {
      ...state,
      extraExpenses: [...state.extraExpenses, { category: action.payload, amount: undefined }]
    }
  }

  if (action.type === ACTION_TYPES.REMOVE_EXTRA_EXPENSES) {
    return {
      ...state,
      extraExpenses: state.extraExpenses.filter((expense) => expense.category !== action.payload)
    }
  }

  if (action.type === ACTION_TYPES.CLEAR_EXTRA_EXPENSES) {
    return { ...state, extraExpenses: [] }
  }

  if (action.type === ACTION_TYPES.UPDATE_EXTRA_EXPENSE) {
    const currentExpenseIndex = state.extraExpenses.findIndex((expense) => expense.category === action.payload.category)
    if (currentExpenseIndex !== -1) {
      state.extraExpenses[currentExpenseIndex] = action.payload
      return { ...state, extraExpenses: [...state.extraExpenses] }
    } else {
      return state
    }
  }

  return state
}

const getInitialState = (transaction: Transaction): ReducerState => {
  const maxExpense = transaction.expenses.length ? transaction.expenses.reduce((max, current) =>
    current.amount > max.amount ? current : max,
    transaction.expenses[0]
  ) : undefined;

  return {
    mainCategory: maxExpense?.category,
    extraExpenses: transaction.expenses.filter(expense => expense !== maxExpense)
  }
}

export const TransactionCard = ({ transaction, forceExpanded }: { transaction: Transaction, forceExpanded?: boolean }) => {
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState(forceExpanded);
  const [state, dispatch] = useReducer(reducer, getInitialState(transaction))
  const [showExtra, setShowExtra] = useState(Boolean(transaction.expenses.length))

  const mainExpenseAmount = useMemo(() => {
    return Math.max(
      Math.abs(transaction.amount) - state.extraExpenses
        .reduce(
          (acc, expense) => acc += expense.amount ?? 0,
          0
        ),
      0)
  }, [state.extraExpenses, transaction.amount])

  const handleMainExpenseChange = (category: string) => {
    dispatch({ type: ACTION_TYPES.CHANGE_MAIN_CATEGORY, payload: category || undefined })

  }

  const handleToggleExtra = () => {
    if (showExtra) {
      setShowExtra(false)
      dispatch({ type: ACTION_TYPES.CLEAR_EXTRA_EXPENSES })
    } else {
      setShowExtra(true)
    }
  }

  const handleCategoryClick = (category: string) => () => {
    if (state.extraExpenses.find(expense => expense.category === category)) {
      dispatch({ type: ACTION_TYPES.REMOVE_EXTRA_EXPENSES, payload: category })
    } else {
      dispatch({ type: ACTION_TYPES.ADD_EXTRA_EXPENSES, payload: category })
    }
  }

  const handleInputChange = (category: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const currentExpenseIndex = state.extraExpenses.findIndex((expense) => expense.category === category)
    
    if (currentExpenseIndex !== -1) {
      const truncated = Math.floor(parseFloat(e.target.value) * 100) / 100;
      dispatch({
        type: ACTION_TYPES.UPDATE_EXTRA_EXPENSE,
        payload: {
          category, amount: e.target.value ? truncated * 100  : undefined
        }
      })
    }
  }

  const createFormData = () => ({
    transaction_id: transaction.id,
    user_id: transaction.user_id,
    time: transaction.time,
    expenses: state.mainCategory ?
      [{ category: state.mainCategory, amount: mainExpenseAmount }, ...state.extraExpenses]
        .filter((category) => category.amount && category.amount > 0)
      : []
  })

  const onSubmit = () => {
    const data = createFormData()
    const validatedData = validateFormData(data, Math.abs(transaction.amount))
    if (validatedData.success) {
      startTransition(() => {
        action(validatedData.data).then((res) => {
          console.log(res);

          if (res.success) {
            setShowExtra(false)
            setActive(false)
          } else {

          }

        });
      });
    } else {
      console.log(validatedData.error);
    }
  }

  const validationResult = validateFormData(createFormData(), Math.abs(transaction.amount))
  console.log(mainExpenseAmount);

  return (
    <div
      onClick={() => setActive(prev => !prev)}
      className={classNames("border-2 border-purple-500 bg-white p-3 rounded-md w-[350px]")}
    >
      <header className="flex justify-between pb-2 mb-2 border-b border-black">
        <h3 className="font-bold">{transaction.description}</h3>
        <span>{new Date(transaction.time).toLocaleDateString()}</span>
      </header>
      <p>Сумма: <span className="italic font-bold">{(transaction.amount / 100).toFixed(2)}</span></p>
      {transaction.comment && <p>Коммент: {transaction.comment}</p>}
      {state.mainCategory && <div className={classNames("mt-4 flex gap-2", { 'hidden': active })}>
        <div className="rounded-md text-white bg-purple-500 p-2">{state.mainCategory}: {(mainExpenseAmount / 100).toFixed(2)} грн</div>
        {state.extraExpenses.map(({ amount, category }) => (
          <div className="rounded-md text-white bg-purple-500 p-2" key={category}>
            {category}: {((amount ?? 0) / 100).toFixed(2)}
          </div>
        ))}
      </div>
      }
      <div className={classNames({ 'hidden': !active })}>

        <div className="mt-4" onClick={e => e.stopPropagation()}>
          <select
            className="border w-full p-2 mb-4"
            value={state.mainCategory}
            onChange={(e) => handleMainExpenseChange(e.target.value)}
          >
            <option value="">Выберите категорию</option>
            {categories.map((category) => (
              <option value={category} key={category}>{category}</option>
            ))}
          </select>
          {!transaction.expenses.length && <button
            disabled={!state.mainCategory}
            onClick={handleToggleExtra}
            className="text-sm text-purple-500 disabled:hidden mb-4"
          >{showExtra ? 'Убрать' : 'Добавить'} доп. категории
          </button>}
        </div>
        <div className={classNames('mt-4', { 'hidden': !showExtra })}>
          <p className="font-bold mb-2">Дополнительные категории:</p>
          <div onClick={e => e.stopPropagation()} className="grid grid-cols-2 gap-2 mb-4">
            {categories.filter((category) => category !== state.mainCategory).map((category) => {
              const currentExpense = state.extraExpenses.find(expense => expense.category === category)
              return (
                <div key={category}>
                  <button
                    onClick={handleCategoryClick(category)}
                    className={classNames("p-2 rounded-t-sm w-full bg-slate-600 text-white text-sm", {
                      "shadow-inner bg-slate-100 text-slate-800": currentExpense
                    })}
                  >{category}</button>
                  {currentExpense && <div className="p-2 flex gap-2 w-full border border-slate-800 rounded-b-sm">
                    <input
                      onChange={handleInputChange(category)}
                      value={currentExpense.amount ? (currentExpense.amount / 100) : undefined}
                      className="min-w-0 outline-none"
                      type="number"
                    />
                    <span>грн</span>
                  </div>}
                </div>
              )
            })}
          </div>
        </div>
        <button
          disabled={isPending || !validationResult.success}
          onClick={onSubmit}
          className="bg-purple-500 w-full p-2 text-white hover:bg-purple-600 disabled:bg-purple-300">
          Подтвердить
        </button>
        {
          !validationResult?.success &&
          state.mainCategory &&
          <p className="text-red-600">{validationResult.error.issues[0].message}</p>
        }
      </div>
    </div>
  )
}
