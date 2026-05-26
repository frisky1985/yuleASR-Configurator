import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  MessageSquare,
  ThumbsUp,
  Eye,
  Flame,
  Clock,
  ChevronRight,
  X,
  Send,
  Plus,
  Search,
  Filter,
  Pin,
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useUserSystem } from '../hooks/useUserSystem';
import { useNotifications } from '../hooks/useNotifications';
import { initialForumPosts, generateId, migrateForumPosts, type ForumPost, type ForumReply } from '../data/communityData';
import { CodeBlock } from '../components/CodeBlock';

function renderRichContent(content: string) {
  const parts: React.ReactNode[] = [];
  const regex = /```(\w*)\n([\s\S]*?)\n```/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <div key={`text-${lastIndex}`} className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
          {content.slice(lastIndex, match.index)}
        </div>
      );
    }
    const language = match[1] || 'c';
    const code = match[2];
    parts.push(<CodeBlock key={`code-${match.index}`} code={code} language={language} />);
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push(
      <div key={`text-${lastIndex}`} className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
        {content.slice(lastIndex)}
      </div>
    );
  }

  return parts;
}

const sortOptions = [
  { label: '最新发布', value: 'newest' },
  { label: '最多回复', value: 'replies' },
  { label: '最多点赞', value: 'likes' },
  { label: '最多浏览', value: 'views' },
];

const allTags = ['全部', 'MCAL', 'ECUAL', 'Service', 'OS', '工具链', '经验分享', 'CAN', 'Pwm', 'i.MX8M', 'Docker', '配置', '量产'];

export function ForumPage() {
  const [posts, setPosts] = useLocalStorage<ForumPost[]>('yuletech-forum-posts', initialForumPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('全部');
  const [sortBy, setSortBy] = useState('newest');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const currentUser = '我';
  const { addPoints } = useUserSystem();
  const { addNotification } = useNotifications();

  const activePost = posts.find((p) => p.id === activePostId);

  // Migrate old data on mount
  useEffect(() => {
    setPosts((prev) => migrateForumPosts(prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPosts = posts
    .filter((post) => {
      const matchSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTag = selectedTag === '全部' || post.tags.includes(selectedTag);
      return matchSearch && matchTag;
    })
    .sort((a, b) => {
      // Pinned posts always on top
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'replies') return b.replies.length - a.replies.length;
      if (sortBy === 'likes') return b.likes - a.likes;
      if (sortBy === 'views') return b.views - a.likes;
      return 0;
    });

  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const alreadyLiked = post.likedBy.includes(currentUser);
        return {
          ...post,
          likes: alreadyLiked ? post.likes - 1 : post.likes + 1,
          likedBy: alreadyLiked ? post.likedBy.filter((u) => u !== currentUser) : [...post.likedBy, currentUser],
        };
      })
    );
  };

  const handleLikeReply = (postId: string, replyId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          replies: post.replies.map((reply) => {
            if (reply.id !== replyId) return reply;
            const alreadyLiked = reply.likedBy.includes(currentUser);
            return {
              ...reply,
              likes: alreadyLiked ? reply.likes - 1 : reply.likes + 1,
              likedBy: alreadyLiked ? reply.likedBy.filter((u) => u !== currentUser) : [...reply.likedBy, currentUser],
            };
          }),
        };
      })
    );
  };

  const handleAddReply = (postId: string) => {
    if (!replyContent.trim()) return;
    const post = posts.find((p) => p.id === postId);
    const newReply: ForumReply = {
      id: generateId('fr'),
      content: replyContent.trim(),
      author: currentUser,
      avatar: '我',
      role: '社区成员',
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, replies: [...p.replies, newReply] } : p))
    );
    setReplyContent('');
    addPoints('reply');
    if (post && post.author === currentUser) {
      addNotification({
        type: 'reply',
        title: '有人回复了你的帖子',
        message: `你的帖子《${post.title}》收到了新回复`,
        link: '/forum',
      });
    }
  };

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    const tags = newPostTags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);
    const newPost: ForumPost = {
      id: generateId('fp'),
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      author: currentUser,
      avatar: '我',
      role: '社区成员',
      tags: tags.length ? tags : ['讨论'],
      likes: 0,
      likedBy: [],
      replies: [],
      views: 0,
      createdAt: new Date().toISOString(),
      hot: false,
    };
    setPosts((prev) => [newPost, ...prev]);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostTags('');
    setShowNewPost(false);
    addPoints('post');
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
        <title>技术论坛 - YuleTech | AutoSAR 讨论区</title>
        <meta name="description" content="讨论 AutoSAR BSW 开发中的技术问题，分享量产经验。发帖讨论、分享经验、求助答疑，与社区工程师共同成长。" />
      </Helmet>
      {/* Header */}
      <div className="bg-gradient-to-br from-muted/50 to-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">技术论坛</h1>
              <p className="text-muted-foreground">讨论 AutoSAR BSW 开发中的技术问题，分享量产经验</p>
            </div>
            <button
              onClick={() => setShowNewPost(true)}
              className="inline-flex items-center gap-2 bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--primary-glow))] transition-colors px-5 py-2.5 rounded-lg font-medium self-start"
            >
              <Plus className="w-4 h-4" />
              发布新帖
            </button>
          </div>

          {/* Search & Filter */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索帖子标题或内容..."
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

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-[hsl(var(--accent))] text-white'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => {
                setActivePostId(post.id);
                setPosts((prev) =>
                  prev.map((p) => (p.id === post.id ? { ...p, views: p.views + 1 } : p))
                );
              }}
              className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-[hsl(var(--accent))]/30 hover:shadow-elegant transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-sm font-bold">
                  {post.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground group-hover:text-[hsl(var(--accent))] transition-colors line-clamp-1">
                      {post.title}
                    </h3>
                    {post.isPinned && <Pin className="w-4 h-4 text-[hsl(var(--accent))] flex-shrink-0" />}
                    {post.hot && <Flame className="w-4 h-4 text-orange-500 flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.content}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{post.author}</span>
                    <span className="px-1.5 py-0.5 bg-muted rounded text-[10px]">{post.role}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(post.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {post.replies.length}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {post.likes}
                    </span>
                    <div className="flex gap-1 ml-auto">
                      {post.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] rounded-full text-[10px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-[hsl(var(--accent))] transition-colors flex-shrink-0 mt-1" />
              </div>
            </div>
          ))}
          {filteredPosts.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>没有找到相关帖子</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedTag('全部'); }}
                className="mt-2 text-[hsl(var(--accent))] hover:underline text-sm"
              >
                清除筛选条件
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Detail Modal */}
      {activePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold pr-4 line-clamp-1">{activePost.title}</h2>
              <button
                onClick={() => setActivePostId(null)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Original Post */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-sm font-bold">
                  {activePost.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{activePost.author}</span>
                    <span className="px-1.5 py-0.5 bg-muted rounded text-[10px] text-muted-foreground">{activePost.role}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{formatTime(activePost.createdAt)}</span>
                  </div>
                  <div>{renderRichContent(activePost.content)}</div>
                  <div className="flex items-center gap-2 mt-3">
                    {activePost.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] rounded-full text-[10px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={() => handleLikePost(activePost.id)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${
                        activePost.likedBy.includes(currentUser)
                          ? 'text-[hsl(var(--accent))]'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {activePost.likes}
                    </button>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MessageSquare className="w-4 h-4" />
                      {activePost.replies.length}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      {activePost.views}
                    </span>
                  </div>
                </div>
              </div>

              {/* Replies */}
              {activePost.replies.length > 0 && (
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-semibold mb-4">{activePost.replies.length} 条回复</h4>
                  <div className="space-y-4">
                    {activePost.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3 pl-4 border-l-2 border-border">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {reply.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{reply.author}</span>
                            <span className="px-1.5 py-0.5 bg-muted rounded text-[10px] text-muted-foreground">{reply.role}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{formatTime(reply.createdAt)}</span>
                          </div>
                          <div className="text-sm text-foreground">{renderRichContent(reply.content)}</div>
                          <button
                            onClick={() => handleLikeReply(activePost.id, reply.id)}
                            className={`flex items-center gap-1 mt-2 text-xs transition-colors ${
                              reply.likedBy.includes(currentUser)
                                ? 'text-[hsl(var(--accent))]'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            {reply.likes}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Input */}
              <div className="border-t border-border pt-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[hsl(var(--accent))]/10 flex items-center justify-center text-xs font-bold text-[hsl(var(--accent))]">
                    我
                  </div>
                  <div className="flex-1 flex gap-2">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="写下你的回复..."
                      rows={3}
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30 resize-none"
                    />
                    <button
                      onClick={() => handleAddReply(activePost.id)}
                      disabled={!replyContent.trim()}
                      className="self-end px-4 py-2 bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--primary-glow))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-lg text-sm font-medium"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">发布新帖</h2>
              <button
                onClick={() => setShowNewPost(false)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">标题</label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="请简要描述你的问题或话题"
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">内容</label>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="详细描述你的问题、经验或想法..."
                  rows={8}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">标签（用逗号分隔）</label>
                <input
                  type="text"
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                  placeholder="例如：MCAL, CAN, 配置"
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
                />
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => setShowNewPost(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreatePost}
                disabled={!newPostTitle.trim() || !newPostContent.trim()}
                className="px-5 py-2 bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--primary-glow))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-lg text-sm font-medium"
              >
                发布
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
