import { Transaction } from "@/models/Transaction";

export const createExpenseMessageTemplate = (data: Transaction) => `
<b>${data.description}</b>
<i>${new Date(data.time * 1000).toLocaleDateString()}</i>
Сумма: ${(data.amount / 100).toFixed(2)}
${data.comment ? 'Коммент: ' + data.comment : ''}
${data.counterName ?? ''}
`
