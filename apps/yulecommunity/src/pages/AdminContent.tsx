import { useState } from 'react';
import {
  MessageSquare,
  HelpCircle,
  Calendar,
  Trash2,
  Pin,
  PinOff,
  Award,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  initialForumPosts,
  initialQuestions,
  initialEvents,
  type ForumPost,
  type Question,
  type CommunityEvent,
} from '../data/communityData';

type ContentTab = 'forum' | 'qa' | 'events';

export function AdminContent() {
  const [activeTab, setActiveTab] = useState<ContentTab>('forum');
  const [search, setSearch] = useState('');

  // Forum
  const [posts, setPosts] = useLocalStorage<ForumPost[]>('yuletech-forum-posts', initialForumPosts);
  // QA
  const [questions, setQuestions] = useLocalStorage<Question[]>('yuletech-qa-questions', initialQuestions);
  // Events
  const [events, setEvents] = useLocalStorage<CommunityEvent[]>('yuletech-events', initialEvents);

  // Expand states
  const [expandedForum, setExpandedForum] = useState<Set<string>>(new Set());
  const [expandedQA, setExpandedQA] = useState<Set<string>>(new Set());
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const tabs = [
    { key: 'forum' as ContentTab, label: '论坛', icon: MessageSquare },
    { key: 'qa' as ContentTab, label: '问答', icon: HelpCircle },
    { key: 'events' as ContentTab, label: '活动', icon: Calendar },
  ];

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase())
  );

  const filteredQuestions = questions.filter(
    (q) =>
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.content.toLowerCase().includes(search.toLowerCase())
  );

  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeletePost = (id: string) => {
    if (!window.confirm('确定要删除这条帖子吗？此操作不可撤销。')) return;
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleTogglePin = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isPinned: !p.isPinned } : p))
    );
  };

  const handleDeleteQuestion = (id: string) => {
    if (!window.confirm('确定要删除这个问题吗？此操作不可撤销。')) return;
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleChangeBounty = (id: string, newBounty: number) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, bounty: Math.max(0, newBounty) } : q))
    );
  };

  const handleDeleteEvent = (id: string) => {
    if (!window.confirm('确定要删除这个活动吗？此操作不可撤销。')) return;
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleChangeEventStatus = (id: string, status: CommunityEvent['status']) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  };

  const toggleExpand = (id: string, set: Set<string>, setFn: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setFn(next);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">内容管理</h2>
        <p className="text-sm text-muted-foreground">管理论坛、问答和活动内容</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSearch(''); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-[hsl(var(--primary))] text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`搜索${activeTab === 'forum' ? '帖子' : activeTab === 'qa' ? '问题' : '活动'}...`}
          className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
        />
      </div>

      {/* Forum Tab */}
      {activeTab === 'forum' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">标题</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">作者</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">回复/浏览</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">状态</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => {
                  const expanded = expandedForum.has(post.id);
                  return (
                    <>
                      <tr key={post.id} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 max-w-xs">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleExpand(post.id, expandedForum, setExpandedForum)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                            <span className="font-medium truncate">{post.title}</span>
                            {post.isPinned && <Pin className="w-3.5 h-3.5 text-[hsl(var(--accent))]" />}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{post.author}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {post.replies.length} / {post.views}
                        </td>
                        <td className="px-4 py-3">
                          {post.isPinned ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]">置顶</span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">普通</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleTogglePin(post.id)}
                              className="p-1.5 rounded-lg hover:bg-[hsl(var(--accent))]/10 hover:text-[hsl(var(--accent))] text-muted-foreground transition-colors"
                              title={post.isPinned ? '取消置顶' : '置顶'}
                            >
                              {post.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expanded && (
                        <tr>
                          <td colSpan={5} className="px-4 py-3 bg-muted/20">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{post.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">发布时间：{formatTime(post.createdAt)}</p>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
                {filteredPosts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      未找到匹配的帖子
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QA Tab */}
      {activeTab === 'qa' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">问题</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">作者</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">悬赏</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">状态</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((q) => {
                  const expanded = expandedQA.has(q.id);
                  return (
                    <>
                      <tr key={q.id} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 max-w-xs">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleExpand(q.id, expandedQA, setExpandedQA)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                            <span className="font-medium truncate">{q.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{q.author}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            <input
                              type="number"
                              min={0}
                              max={1000}
                              value={q.bounty}
                              onChange={(e) => handleChangeBounty(q.id, Number(e.target.value))}
                              className="w-16 px-1.5 py-0.5 bg-background border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]/30"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${q.status === 'resolved' ? 'bg-green-500/10 text-green-500' : 'bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]'}`}>
                            {q.status === 'resolved' ? '已解决' : '未解决'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                      {expanded && (
                        <tr>
                          <td colSpan={5} className="px-4 py-3 bg-muted/20">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{q.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">提问时间：{formatTime(q.createdAt)} · {q.answers.length} 个回答</p>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
                {filteredQuestions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      未找到匹配的问题
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">活动</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">日期</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">类型</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">状态</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((evt) => {
                  const expanded = expandedEvents.has(evt.id);
                  return (
                    <>
                      <tr key={evt.id} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 max-w-xs">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleExpand(evt.id, expandedEvents, setExpandedEvents)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                            <span className="font-medium truncate">{evt.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{evt.date}</td>
                        <td className="px-4 py-3 text-muted-foreground">{evt.type === 'online' ? '线上' : '线下'}</td>
                        <td className="px-4 py-3">
                          <select
                            value={evt.status}
                            onChange={(e) => handleChangeEventStatus(evt.id, e.target.value as CommunityEvent['status'])}
                            className="px-2 py-1 bg-background border border-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]/30"
                          >
                            <option value="upcoming">即将开始</option>
                            <option value="ongoing">进行中</option>
                            <option value="ended">已结束</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteEvent(evt.id)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                      {expanded && (
                        <tr>
                          <td colSpan={5} className="px-4 py-3 bg-muted/20">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">{evt.description}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              时间：{evt.time} · 地点：{evt.location || '-'} · 主讲：{evt.speaker}
                            </p>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
                {filteredEvents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      未找到匹配的活动
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
