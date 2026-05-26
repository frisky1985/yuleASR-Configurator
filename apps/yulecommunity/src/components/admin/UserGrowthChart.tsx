import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { PointsHistoryItem, UserSystemState } from '../../hooks/useUserSystem';

function formatDateLabel(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function UserGrowthChart() {
  const [state] = useLocalStorage<UserSystemState>('yuletech-user-system', { points: 0, history: [] });

  const data = useMemo(() => {
    const today = new Date();
    const days: { date: string; label: string; total: number; newUsers: number }[] = [];

    // Try to derive real signup data from points history timestamps
    const historyItems = state?.history || [];
    const dailyNewUsers = new Map<string, number>();

    historyItems.forEach((item: PointsHistoryItem) => {
      const key = item.timestamp.split('T')[0];
      dailyNewUsers.set(key, (dailyNewUsers.get(key) || 0) + 1);
    });

    const hasRealData = dailyNewUsers.size > 0;

    // Base user count (mock existing users)
    let baseUsers = 24;
    let cumulative = baseUsers;

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = getDateKey(d);
      const label = formatDateLabel(d);

      let newUsers: number;
      if (hasRealData) {
        newUsers = dailyNewUsers.get(key) || 0;
      } else {
        // Simulate data: 1-5 new users per day, with some variance
        const seed = d.getDate() + d.getMonth() * 31;
        newUsers = Math.floor((Math.sin(seed) + 1.5) * 2) + 1;
        if (newUsers < 0) newUsers = 1;
        if (newUsers > 5) newUsers = 5;
      }

      cumulative += newUsers;
      days.push({ date: key, label, total: cumulative, newUsers });
    }

    return days;
  }, [state]);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
          formatter={(value: unknown) => [`${value} 人`, '数量']}
        />
        <Legend
          wrapperStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Line
          type="monotone"
          dataKey="total"
          name="总用户数"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="newUsers"
          name="新增用户"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
