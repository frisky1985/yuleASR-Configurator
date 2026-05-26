import { useState, useMemo } from 'react';
import { Search, Filter, Plus, Minus, RotateCcw, Star, Award } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getLevelInfo } from '../hooks/useUserSystem';

interface AdminUser {
  id: string;
  username: string;
  points: number;
  level: number;
  title: string;
  registeredAt: string;
}

function generateSampleUsers(): AdminUser[] {
  const now = Date.now();
  const users: AdminUser[] = [
    { id: 'u-1', username: '社区用户001', points: 2450, level: 4, title: '技术专家', registeredAt: new Date(now - 90 * 86400000).toISOString() },
    { id: 'u-2', username: '社区用户002', points: 1200, level: 3, title: '高级工程师', registeredAt: new Date(now - 80 * 86400000).toISOString() },
    { id: 'u-3', username: '社区用户003', points: 800, level: 3, title: '高级工程师', registeredAt: new Date(now - 70 * 86400000).toISOString() },
    { id: 'u-4', username: '社区用户004', points: 350, level: 2, title: '中级工程师', registeredAt: new Date(now - 60 * 86400000).toISOString() },
    { id: 'u-5', username: '社区用户005', points: 180, level: 2, title: '中级工程师', registeredAt: new Date(now - 50 * 86400000).toISOString() },
    { id: 'u-6', username: '社区用户006', points: 85, level: 1, title: '初级工程师', registeredAt: new Date(now - 40 * 86400000).toISOString() },
    { id: 'u-7', username: '社区用户007', points: 45, level: 1, title: '初级工程师', registeredAt: new Date(now - 30 * 86400000).toISOString() },
    { id: 'u-8', username: '社区用户008', points: 12, level: 1, title: '初级工程师', registeredAt: new Date(now - 20 * 86400000).toISOString() },
    { id: 'u-9', username: '社区用户009', points: 600, level: 3, title: '高级工程师', registeredAt: new Date(now - 10 * 86400000).toISOString() },
    { id: 'u-10', username: '社区用户010', points: 220, level: 2, title: '中级工程师', registeredAt: new Date(now - 5 * 86400000).toISOString() },
  ];
  // Merge current user system points if available
  try {
    const raw = localStorage.getItem('yuletech-user-system');
    if (raw) {
      const parsed = JSON.parse(raw) as { points?: number };
      if (typeof parsed.points === 'number') {
        const info = getLevelInfo(parsed.points);
        users.unshift({
          id: 'u-me',
          username: '当前用户',
          points: parsed.points,
          level: info.level,
          title: info.title,
          registeredAt: new Date(now - 100 * 86400000).toISOString(),
        });
      }
    }
  } catch {
    // ignore
  }
  return users;
}

const levelFilters = [
  { label: '全部', value: 'all' },
  { label: '初级工程师', value: '1' },
  { label: '中级工程师', value: '2' },
  { label: '高级工程师', value: '3' },
  { label: '技术专家', value: '4' },
];

export function AdminUsers() {
  const [users, setUsers] = useLocalStorage<AdminUser[]>('yuletech-users', generateSampleUsers());
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch = u.username.toLowerCase().includes(search.toLowerCase());
      const matchLevel = levelFilter === 'all' || String(u.level) === levelFilter;
      return matchSearch && matchLevel;
    });
  }, [users, search, levelFilter]);

  const handleAdjustPoints = (id: string, delta: number) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const newPoints = Math.max(0, u.points + delta);
        const info = getLevelInfo(newPoints);
        return { ...u, points: newPoints, level: info.level, title: info.title };
      })
    );
  };

  const handleResetPoints = (id: string) => {
    if (!window.confirm('确定要重置该用户的积分吗？')) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const info = getLevelInfo(0);
        return { ...u, points: 0, level: info.level, title: info.title };
      })
    );
  };

  const startEdit = (u: AdminUser) => {
    setEditingId(u.id);
    setEditValue(String(u.points));
  };

  const finishEdit = (id: string) => {
    const val = parseInt(editValue, 10);
    if (Number.isNaN(val)) {
      setEditingId(null);
      return;
    }
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const newPoints = Math.max(0, val);
        const info = getLevelInfo(newPoints);
        return { ...u, points: newPoints, level: info.level, title: info.title };
      })
    );
    setEditingId(null);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('zh-CN');
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return 'text-green-500 bg-green-500/10';
      case 2:
        return 'text-blue-500 bg-blue-500/10';
      case 3:
        return 'text-amber-500 bg-amber-500/10';
      case 4:
        return 'text-purple-500 bg-purple-500/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">用户管理</h2>
        <p className="text-sm text-muted-foreground">查看和管理社区用户</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索用户名..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
          >
            {levelFilters.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">用户</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">积分</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">等级</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">头衔</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">注册时间</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-xs font-bold">
                        {u.username.slice(-2)}
                      </div>
                      <span className="font-medium">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {editingId === u.id ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => finishEdit(u.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') finishEdit(u.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                        className="w-24 px-2 py-1 bg-background border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
                      />
                    ) : (
                      <button
                        onClick={() => startEdit(u)}
                        className="flex items-center gap-1 font-medium hover:text-[hsl(var(--accent))] transition-colors"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        {u.points}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getLevelColor(u.level)}`}>
                      <Star className="w-3 h-3" />
                      Lv.{u.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(u.registeredAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAdjustPoints(u.id, 10)}
                        className="p-1.5 rounded-lg hover:bg-green-500/10 hover:text-green-500 text-muted-foreground transition-colors"
                        title="增加10积分"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleAdjustPoints(u.id, -10)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                        title="减少10积分"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleResetPoints(u.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                        title="重置积分"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    未找到匹配的用户
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
