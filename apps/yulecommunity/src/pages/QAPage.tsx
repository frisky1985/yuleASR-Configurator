import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  HelpCircle,
  CheckCircle2,
  MessageSquare,
  Eye,
  ThumbsUp,
  Award,
  X,
  Send,
  Plus,
  Search,
  Filter,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useUserSystem } from '../hooks/useUserSystem';
import { useNotifications } from '../hooks/useNotifications';
import { initialQuestions, generateId, type Question, type Answer } from '../data/communityData';

const sortOptions = [
  { label: '最新提问', value: 'newest' },
  { label: '悬赏最高', value: 'bounty' },
  { label: '最多浏览', value: 'views' },
];

const statusFilters = [
  { label: '全部', value: 'all' },
  { label: '未解决', value: 'open' },
  { label: '已解决', value: 'resolved' },
];

export function QAPage() {
  const [questions, setQuestions] = useLocalStorage<Question[]>('yuletech-qa-questions', initialQuestions);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newBounty, setNewBounty] = useState(10);
  const [answerContent, setAnswerContent] = useState('');
  const currentUser = '我';
  const { addPoints } = useUserSystem();
  const { addNotification } = useNotifications();

  const filteredQuestions = questions
    .filter((q) => {
      const matchSearch =
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || q.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'bounty') return b.bounty - a.bounty;
      if (sortBy === 'views') return b.views - a.views;
      return 0;
    });

  const handleLikeAnswer = (questionId: string, answerId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          answers: q.answers.map((ans) => {
            if (ans.id !== answerId) return ans;
            const alreadyLiked = ans.likedBy.includes(currentUser);
            return {
              ...ans,
              likes: alreadyLiked ? ans.likes - 1 : ans.likes + 1,
              likedBy: alreadyLiked ? ans.likedBy.filter((u) => u !== currentUser) : [...ans.likedBy, currentUser],
            };
          }),
        };
      })
    );
  };

  const handleAcceptAnswer = (questionId: string, answerId: string) => {
    const question = questions.find((q) => q.id === questionId);
    const answer = question?.answers.find((a) => a.id === answerId);
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          status: 'resolved',
          answers: q.answers.map((ans) => ({
            ...ans,
            isAccepted: ans.id === answerId,
          })),
        };
      })
    );
    if (answer && answer.author === currentUser) {
      addPoints('accepted');
      addNotification({
        type: 'points_change',
        title: '回答被采纳',
        message: `你的回答被采纳，获得 50 积分`,
        link: '/qa',
      });
    }
  };

  const handleAddAnswer = (questionId: string) => {
    if (!answerContent.trim()) return;
    const question = questions.find((q) => q.id === questionId);
    const newAnswer: Answer = {
      id: generateId('ans'),
      content: answerContent.trim(),
      author: currentUser,
      avatar: '我',
      role: '社区成员',
      isAccepted: false,
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
    };
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, answers: [...q.answers, newAnswer] } : q))
    );
    setAnswerContent('');
    addPoints('answer');
    if (question && question.author === currentUser) {
      addNotification({
        type: 'answer',
        title: '有人回答了你的问题',
        message: `你的问题《${question.title}》收到了新回答`,
        link: '/qa',
      });
    }
  };

  const handleCreateQuestion = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const tags = newTags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);
    const newQuestion: Question = {
      id: generateId('qa'),
      title: newTitle.trim(),
      content: newContent.trim(),
      author: currentUser,
      avatar: '我',
      role: '社区成员',
      tags: tags.length ? tags : ['问答'],
      status: 'open',
      bounty: newBounty,
      views: 0,
      answers: [],
      createdAt: new Date().toISOString(),
    };
    setQuestions((prev) => [newQuestion, ...prev]);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setNewBounty(10);
    setShowNewQuestion(false);
    addPoints('post', '发布问题');
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;
    return d.toLocaleDateString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <Helmet>
        <title>技术问答 - YuleTech | AutoSAR 悬赏问答</title>
        <meta name="description" content="悬赏提问，专家解答，共建 AutoSAR 知识库。解决 MCAL、ECUAL、Service 层开发中的具体技术难题。" />
      </Helmet>
      {/* Header */}
      <div className="bg-gradient-to-br from-muted/50 to-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">技术问答</h1>
              <p className="text-muted-foreground">悬赏提问，专家解答，共建 AutoSAR 知识库</p>
            </div>
            <button
              onClick={() => setShowNewQuestion(true)}
              className="inline-flex items-center gap-2 bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--primary-glow))] transition-colors px-5 py-2.5 rounded-lg font-medium self-start"
            >
              <Plus className="w-4 h-4" />
              我要提问
            </button>
          </div>

          {/* Search & Filter */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索问题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filters */}
          <div className="mt-4 flex gap-2">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === f.value
                    ? 'bg-[hsl(var(--accent))] text-white'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const isExpanded = expandedQuestionId === q.id;
            return (
              <div
                key={q.id}
                className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-[hsl(var(--accent))]/30"
              >
                {/* Question Summary */}
                <div
                  onClick={() => {
                    setExpandedQuestionId(isExpanded ? null : q.id);
                    if (!isExpanded) {
                      setQuestions((prev) =>
                        prev.map((item) => (item.id === q.id ? { ...item, views: item.views + 1 } : item))
                      );
                    }
                  }}
                  className="p-5 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {q.status === 'resolved' ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <HelpCircle className="w-6 h-6 text-[hsl(var(--accent))]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground line-clamp-1">{q.title}</h3>
                        {q.bounty > 0 && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-bold">
                            <Award className="w-3 h-3" />
                            {q.bounty} 积分
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{q.content}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {q.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(q.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {q.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {q.answers.length} 回答
                        </span>
                        <div className="flex gap-1 ml-auto">
                          {q.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-muted rounded-full text-[10px]">
                              {tag}
                            </span>
                          ))}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 ml-2" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-2" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Answers */}
                {isExpanded && (
                  <div className="border-t border-border px-5 pb-5">
                    <div className="pt-4 space-y-4">
                      {q.answers.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">暂无回答，来抢首答吧！</p>
                      )}
                      {q.answers.map((ans) => (
                        <div
                          key={ans.id}
                          className={`flex gap-3 p-4 rounded-xl ${
                            ans.isAccepted ? 'bg-green-500/5 border border-green-500/20' : 'bg-muted/30'
                          }`}
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {ans.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{ans.author}</span>
                              {ans.isAccepted && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-500 rounded text-[10px] font-bold">
                                  <CheckCircle2 className="w-3 h-3" />
                                  已采纳
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground ml-auto">{formatTime(ans.createdAt)}</span>
                            </div>
                            <p className="text-sm text-foreground whitespace-pre-wrap">{ans.content}</p>
                            <div className="flex items-center gap-4 mt-3">
                              <button
                                onClick={() => handleLikeAnswer(q.id, ans.id)}
                                className={`flex items-center gap-1 text-xs transition-colors ${
                                  ans.likedBy.includes(currentUser)
                                    ? 'text-[hsl(var(--accent))]'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                {ans.likes}
                              </button>
                              {q.status === 'open' && !ans.isAccepted && (
                                <button
                                  onClick={() => handleAcceptAnswer(q.id, ans.id)}
                                  className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 transition-colors"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  采纳回答
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Answer Input */}
                      <div className="flex gap-3 pt-2">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[hsl(var(--accent))]/10 flex items-center justify-center text-xs font-bold text-[hsl(var(--accent))]">
                          我
                        </div>
                        <div className="flex-1 flex gap-2">
                          <textarea
                            value={answerContent}
                            onChange={(e) => setAnswerContent(e.target.value)}
                            placeholder={q.status === 'resolved' ? '该问题已解决' : '写下你的回答...'}
                            disabled={q.status === 'resolved'}
                            rows={3}
                            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30 resize-none disabled:opacity-50"
                          />
                          <button
                            onClick={() => handleAddAnswer(q.id)}
                            disabled={!answerContent.trim() || q.status === 'resolved'}
                            className="self-end px-4 py-2 bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--primary-glow))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-lg text-sm font-medium"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filteredQuestions.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>没有找到相关问题</p>
            </div>
          )}
        </div>
      </div>

      {/* New Question Modal */}
      {showNewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">我要提问</h2>
              <button onClick={() => setShowNewQuestion(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">问题标题</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="一句话描述你的问题"
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">问题详情</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="详细描述你遇到的问题，包括环境、已尝试的方案等..."
                  rows={6}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">标签（用逗号分隔）</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="例如：OS, FreeRTOS, Alarm"
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">悬赏积分</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={newBounty}
                    onChange={(e) => setNewBounty(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-bold text-amber-500 w-12 text-right">{newBounty}</span>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => setShowNewQuestion(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateQuestion}
                disabled={!newTitle.trim() || !newContent.trim()}
                className="px-5 py-2 bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--primary-glow))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-lg text-sm font-medium"
              >
                发布问题
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
