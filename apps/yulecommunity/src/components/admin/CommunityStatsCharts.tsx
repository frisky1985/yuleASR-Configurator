import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
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
import { articlesData } from '../../pages/BlogPage';

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];

function formatDateLabel(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function CommunityContentDistribution() {
  const [posts] = useLocalStorage<ForumPost[]>('yuletech-forum-posts', initialForumPosts);
  const [questions] = useLocalStorage<Question[]>('yuletech-qa-questions', initialQuestions);
  const [events] = useLocalStorage<CommunityEvent[]>('yuletech-events', initialEvents);

  const data = useMemo(() => {
    return [
      { name: '论坛帖子', value: posts.length, color: COLORS[0] },
      { name: '问答问题', value: questions.length, color: COLORS[1] },
      { name: '社区活动', value: events.length, color: COLORS[2] },
      { name: '博客文章', value: articlesData.length, color: COLORS[3] },
    ];
  }, [posts.length, questions.length, events.length]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={4}
          dataKey="value"
          stroke="hsl(var(--card))"
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--foreground))',
          }}
          formatter={(value: unknown) => [`${value} 个`, '数量']}
        />
        <Legend wrapperStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CommunityActivityTrend() {
  const [posts] = useLocalStorage<ForumPost[]>('yuletech-forum-posts', initialForumPosts);
  const [questions] = useLocalStorage<Question[]>('yuletech-qa-questions', initialQuestions);
  const [events] = useLocalStorage<CommunityEvent[]>('yuletech-events', initialEvents);

  const data = useMemo(() => {
    const today = new Date();
    const days: { label: string; count: number }[] = [];

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
      e.attendees.forEach(() => allTimestamps.push(`${e.date}T00:00:00`));
    });

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
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="communityActivityGradient" x1="0" y1="0" x2="0" y2="1">
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
          formatter={(value: unknown) => [`${value} 次互动`, '活跃度']}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="hsl(var(--accent))"
          strokeWidth={2}
          fill="url(#communityActivityGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
