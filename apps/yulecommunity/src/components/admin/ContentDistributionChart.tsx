import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
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
import { articlesData } from '../../pages/BlogPage';

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];

export function ContentDistributionChart() {
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
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
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
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value: unknown) => [`${value} 个`, '数量']}
        />
        <Legend
          wrapperStyle={{ color: 'hsl(var(--foreground))' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
