'use client'

import { CategoryAnalytic } from "@/models/Analytic"
import Chart from "react-google-charts"

export const MonthAnalyticChart = ({ data }: { data: CategoryAnalytic[] }) => {
  const totalAmount = data.reduce((acc, { total_amount }) => acc += total_amount, 0)
  const chartData = [
    ['Категория', 'Сумма', { type: 'string', role: 'tooltip' }],
    ...data.map(({ category, total_amount }) => [category, Math.abs(total_amount) / 100, `${(total_amount / 100).toFixed(2)} грн.`])
  ]
  return (
    <div>
      <p className="text-white">Всего потрачено: {(totalAmount / 100).toFixed(2)} грн.</p>
      <Chart chartType="PieChart" data={chartData} options={{
        backgroundColor: '#1e293b',
        legend: {
          textStyle: { color: 'white' },
          position: 'bottom'
        }

      }} />
    </div>
  )
}
