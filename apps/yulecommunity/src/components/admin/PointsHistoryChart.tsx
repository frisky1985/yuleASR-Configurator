import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { PointsHistoryItem } from '../../hooks/useUserSystem';

function formatDateLabel(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function PointsHistoryChart() {
  const [state] = useLocalStorage<{ points: number; history: PointsHistoryItem[] }>(
    'yuletech-user-system',
    { points: 0, history: [] }
  );

  const data = useMemo(() => {
    const history = state?.history || [];
    const today = new Date();
    const days: { label: string; positive: number; negative: number }[] = [];

    // Initialize last 14 days
    const dailyPositive = new Map<string, number>();
    const dailyNegative = new Map<string, number>();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = getDateKey(d);
      dailyPositive.set(key, 0);
      dailyNegative.set(key, 0);
    }

    history.forEach((item) => {
      const key = item.timestamp.split('T')[0];
      if (dailyPositive.has(key)) {
        if (item.points >= 0) {
          dailyPositive.set(key, (dailyPositive.get(key) || 0) + item.points);
        } else {
          dailyNegative.set(key, (dailyNegative.get(key) || 0) + Math.abs(item.points));
        }
      }
    });

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = getDateKey(d);
      days.push({
        label: formatDateLabel(d),
        positive: dailyPositive.get(key) || 0,
        negative: dailyNegative.get(key) || 0,
      });
    }

    return days;
  }, [state]);

  const hasData = data.some((d) => d.positive > 0 || d.negative > 0);

  if (!hasData) {
    return (
      <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
        暂无积分变动记录
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="label"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={{ stroke: 'hsl(var(--border))' }}
        />
        <YAxis
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={{ stroke: 'hsl(var(--border))' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--foreground))',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value: unknown, name: unknown) => [
            `${value} 积分`,
            name === 'positive' ? '获得积分' : '消耗积分',
          ]}
        />
        <Bar dataKey="positive" name="positive" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="negative" name="negative" fill="#f43f5e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
