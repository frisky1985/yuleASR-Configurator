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
import type { PointsHistoryItem, PointsAction } from '../../hooks/useUserSystem';

const ACTION_LABELS: Record<PointsAction, string> = {
  post: '发帖积分',
  reply: '回帖积分',
  answer: '回答积分',
  accepted: '采纳积分',
  event: '活动积分',
};

export function PointsSourceChart() {
  const [state] = useLocalStorage<{ points: number; history: PointsHistoryItem[] }>(
    'yuletech-user-system',
    { points: 0, history: [] }
  );

  const data = useMemo(() => {
    const history = state?.history || [];

    if (history.length === 0) {
      // Demo data when no history exists
      return [
        { name: '发帖积分', value: 120 },
        { name: '回帖积分', value: 85 },
        { name: '回答积分', value: 150 },
        { name: '采纳积分', value: 200 },
        { name: '活动积分', value: 60 },
      ];
    }

    const totals: Record<PointsAction, number> = {
      post: 0,
      reply: 0,
      answer: 0,
      accepted: 0,
      event: 0,
    };

    history.forEach((item) => {
      if (item.action in totals) {
        totals[item.action] += item.points;
      }
    });

    return (Object.keys(totals) as PointsAction[]).map((action) => ({
      name: ACTION_LABELS[action],
      value: totals[action],
    }));
  }, [state]);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="name"
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
          formatter={(value: unknown) => [`${value} 积分`, '累计']}
        />
        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
