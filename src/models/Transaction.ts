import { Expense } from "./Expense";

export interface Transaction {
  id: string;
  user_id: string;
  time: Date;
  description?: string;
  amount: number;
  comment?: string;
  counter_name?: string;
  expenses: Expense[];
}

export interface MonobankTransaction {
  id: string;
  user_id: string;
  time: number;
  description?: string;
  amount: number;
  comment?: string;
  counterName?: string;
}
