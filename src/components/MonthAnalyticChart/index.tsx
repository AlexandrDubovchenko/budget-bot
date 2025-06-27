'use client'

import { CategoryAnalytic } from "@/models/Analytic"
import { formatCurrency } from "@/utils/currency"
import { useState } from "react"
import Chart from "react-google-charts"

const MIN_COUNT = 4

export const MonthAnalyticChart = ({ data }: { data: CategoryAnalytic[] }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const totalAmount = data.reduce((acc, { total_amount }) => acc += total_amount, 0)
  const chartData = [
    ['Категория', 'Сумма', { role: 'annotation' }],
    ...data.map(({ category, total_amount }) => [category, Math.abs(total_amount) / 100, `${(total_amount / 100).toFixed(2)} грн. \n ${category}`])
  ]
  const sortedData = data.toSorted((a, b) => a.total_amount - b.total_amount)
  if (!data.length) {
    return <p className="text-white">Нет данных</p>
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between">
        <p className="text-white flex-2 break-all">Всего потрачено: {formatCurrency(totalAmount / 100)}</p>
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-purple-500 underline flex">{isExpanded ? 'Скрыть' : 'Раскрыть'}</button>
      </div>


      <div className={`grid grid-cols-2 gap-4 ${isExpanded ? '' : ' [&>*:nth-child(n+5)]:hidden'}`}>
        {sortedData.map((d) => (
          <div className="border border-purple-500 rounded-md">
            <div className="p-1 bg-purple-500 text-white">
              {d.category}
            </div>
            <div className="p-1 bg-white">
              {formatCurrency(Math.abs(d.total_amount) / 100)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
