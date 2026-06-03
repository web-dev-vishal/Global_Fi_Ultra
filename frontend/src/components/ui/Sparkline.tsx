import React from 'react'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

interface SparklineProps {
  data: { t: number; v: number }[]
  positive?: boolean
  height?: number
}

export function Sparkline({ data, positive = true, height = 40 }: SparklineProps) {
  // Chart line: emerald for positive, red for negative — per spec
  const strokeColor = positive ? '#10B981' : '#EF4444'

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={strokeColor}
          strokeWidth={1.5}
          dot={false}
        />
        <Tooltip contentStyle={{ display: 'none' }} cursor={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
