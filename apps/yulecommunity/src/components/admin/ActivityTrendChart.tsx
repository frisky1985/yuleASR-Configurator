import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  initialForumPosts,
  initialQuestions,
  initialEvents,
  type ForumPost,
  type Question,
  type CommunityEvent,
} from '../../data/communityData';

function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDateLabel(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function ActivityTrendChart() {
  const [posts] = useLocalStorage<ForumPost[]>('yuletech-forum-posts', initialForumPosts);
  const [questions] = useLocalStorage<Question[]>('yuletech-qa-questions', initialQuestions);
  const [events] = useLocalStorage<CommunityEvent[]>('yuletech-events', initialEvents);

  const data = useMemo(() => {
    const today = new Date();
    const days: { label: string; count: number }[] = [];

    // Collect all timestamps for activity calculation
    const allTimestamps: string[] = [];

    posts.forEach((p) => {
      allTimestamps.push(p.createdAt);
      p.replies.forEach((r) => allTimestamps.push(r.createdAt));
    });

    questions.forEach((q) => {
      allTimestamps.push(q.createdAt);
      q.answers.forEach((a) => allTimestamps.push(a.createdAt));
    });

    events.forEach((e) => {
      // Count event attendee signups as activity
      e.attendees.forEach(() => {
        allTimestamps.push(`${e.date}T00:00:00`);
      });
    });

    // Count activities per day for last 14 days
    const dailyCounts = new Map<string, number>();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dailyCounts.set(getDateKey(d), 0);
    }

    allTimestamps.forEach((ts) => {
      const key = ts.split('T')[0];
      if (dailyCounts.has(key)) {
        dailyCounts.set(key, (dailyCounts.get(key) || 0) + 1);
      }
    });

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push({
        label: formatDateLabel(d),
        count: dailyCounts.get(getDateKey(d)) || 0,
      });
    }

    return days;
  }, [posts, questions, events]);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
            <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.05} />
          </linearGradient>
        </defs>
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
          formatter={(value: unknown) => [`${value} 次互动`, '活跃度']}
        />
        <Area
          type="monotone"
          dataKey="count"
          name="互动次数"
          stroke="hsl(var(--accent))"
          strokeWidth={2}
          fill="url(#activityGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
