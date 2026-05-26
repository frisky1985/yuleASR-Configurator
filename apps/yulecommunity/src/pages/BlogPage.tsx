import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FileText,
  Search,
  Clock,
  Eye,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  User,
  ChevronRight,
  Flame,
  X,
  Send,
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId } from '../data/communityData';
import { CodeBlock } from '../components/CodeBlock';

const categories = ['全部', 'MCAL', 'ECUAL', 'Service', '工具链', '功能安全', '架构设计'];

const hotTags = ['AutoSAR', 'CAN', 'i.MX8M', 'UDS', 'MCAL', 'RTE', '功能安全', '诊断', '配置工具', 'Docker', 'MISRA', '多核'];

interface BlogComment {
  id: string;
  articleId: string;
  content: string;
  author: string;
  avatar: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
}

export const articlesData = [
  {
    id: 'blog-1',
    title: 'AutoSAR BSW 分层架构深度解析：从 MCAL 到 RTE 的完整数据流',
    desc: '本文深入剖析 AutoSAR Classic Platform 的软件分层架构，详细讲解从微控制器驱动层（MCAL）到运行时环境（RTE）的完整数据流动路径，结合 YuleTech 开源实现进行代码级解读。',
    author: '李架构',
    avatar: '李架',
    role: '首席架构师',
    date: '2026-04-20',
    readTime: '15 分钟',
    views: 3420,
    likes: 128,
    comments: 36,
    tags: ['架构设计', 'AutoSAR', 'BSW'],
    category: '架构设计',
    hot: true,
    content: `AutoSAR Classic Platform 采用严格的分层软件架构，从底层硬件到上层应用，每一层都有明确的职责和接口定义。\n\n## 1. 软件分层概览\n\nAutoSAR BSW 栈从上到下依次为：\n- RTE（运行时环境）\n- Service 层（Com, PduR, NvM, Dcm, Dem）\n- ECUAL 层（CanIf, IoHwAb, CanTp 等）\n- MCAL 层（Mcu, Port, Dio, Can, Spi 等）\n- 微控制器硬件\n\n## 2. 数据流分析\n\n以 CAN 信号发送为例，完整的数据流路径为：\n\nASW (SWC) → RTE → Com → PduR → CanIf → Can (MCAL) → FlexCAN (Hardware)\n\n每一层都通过标准化的接口进行数据交换，确保软件组件的可移植性和可替换性。`,
  },
  {
    id: 'blog-2',
    title: 'CAN FD 驱动开发实战：从寄存器到 AutoSAR 接口',
    desc: '手把手讲解如何实现 CAN FD 驱动，从 FlexCAN 寄存器配置到 AutoSAR Can 模块的完整对接流程。',
    author: '张明',
    avatar: '张明',
    role: '嵌入式工程师',
    date: '2026-04-19',
    readTime: '12 分钟',
    views: 1860,
    likes: 72,
    comments: 18,
    tags: ['MCAL', 'CAN', 'i.MX8M'],
    category: 'MCAL',
    hot: true,
    content: '本平台集成了 FlexCAN 模块，支持经典 CAN 和 CAN FD 两种模式。本文将详细介绍从寄存器配置到 AutoSAR Can 模块接口的完整实现。',
  },
  {
    id: 'blog-3',
    title: 'CanIf 模块配置最佳实践：信号路由与 PDU 映射',
    desc: '总结 CanIf 模块在实际项目中的配置经验，包括 HOH 配置、PDU 路由表设计、以及 Upper Layer 接口对接要点。',
    author: '李华',
    avatar: '李华',
    role: '软件架构师',
    date: '2026-04-18',
    readTime: '10 分钟',
    views: 1540,
    likes: 58,
    comments: 14,
    tags: ['ECUAL', 'CanIf', '配置'],
    category: 'ECUAL',
    hot: true,
    content: 'CanIf（CAN Interface）是 ECUAL 层的关键模块，负责为上层的 PduR 和 Com 提供与硬件无关的 CAN 通信接口。',
  },
  {
    id: 'blog-4',
    title: 'AutoSAR Com 模块信号打包与解包机制详解',
    desc: '深入讲解 Com 模块的信号（Signal）和信号组（Signal Group）打包机制，包括字节序、对齐方式和更新位处理。',
    author: '王强',
    avatar: '王强',
    role: '通信工程师',
    date: '2026-04-17',
    readTime: '18 分钟',
    views: 1200,
    likes: 45,
    comments: 9,
    tags: ['Service', 'Com', '通信'],
    category: 'Service',
    hot: false,
    content: 'Com 模块是 AutoSAR 通信栈的核心，负责将应用层的信号数据打包成 PDU，以及将接收到的 PDU 解包成信号数据。',
  },
  {
    id: 'blog-5',
    title: 'YuleConfig 工具链插件开发入门指南',
    desc: '介绍 YuleTech 配置工具链的插件架构，如何开发自定义模块配置界面和代码生成器。',
    author: '刘洋',
    avatar: '刘洋',
    role: 'DevOps工程师',
    date: '2026-04-16',
    readTime: '8 分钟',
    views: 980,
    likes: 38,
    comments: 7,
    tags: ['工具链', 'YuleConfig', '插件'],
    category: '工具链',
    hot: false,
    content: 'YuleConfig 是 YuleTech 开源的 AutoSAR BSW 配置工具链，采用插件化架构，支持自定义模块配置界面和代码生成器开发。',
  },
  {
    id: 'blog-6',
    title: 'ISO 26262 功能安全在 AutoSAR BSW 中的实现要点',
    desc: '从 ASIL 等级划分到 E2E 保护，系统讲解功能安全要求在基础软件各层级的实现策略。',
    author: '陈工',
    avatar: '陈工',
    role: '功能安全工程师',
    date: '2026-04-15',
    readTime: '20 分钟',
    views: 2100,
    likes: 89,
    comments: 22,
    tags: ['功能安全', 'ISO 26262', 'E2E'],
    category: '功能安全',
    hot: true,
    content: 'ISO 26262 是汽车功能安全的国际标准，AutoSAR BSW 作为基础软件，需要在架构设计和代码实现中充分考虑功能安全要求。',
  },
  {
    id: 'blog-7',
    title: '从 0 到 1：搭建 AutoSAR BSW 持续集成流水线',
    desc: '基于 GitHub Actions 和 Docker 搭建完整的 BSW 编译、静态分析和单元测试流水线。',
    author: '赵敏',
    avatar: '赵敏',
    role: 'CI/CD工程师',
    date: '2026-04-14',
    readTime: '14 分钟',
    views: 1120,
    likes: 41,
    comments: 11,
    tags: ['工具链', 'CI/CD', 'Docker'],
    category: '工具链',
    hot: false,
    content: '持续集成是现代软件开发的标准实践，对于 AutoSAR BSW 这种对质量要求极高的嵌入式软件尤为重要。',
  },
  {
    id: 'blog-8',
    title: 'PduR 模块路由策略设计与性能优化',
    desc: 'PduR 作为 PDU 路由的核心模块，本文分析其路由表设计、缓冲策略和性能优化技巧。',
    author: '孙博',
    avatar: '孙博',
    role: '高级软件工程师',
    date: '2026-04-13',
    readTime: '16 分钟',
    views: 890,
    likes: 33,
    comments: 6,
    tags: ['Service', 'PduR', '性能优化'],
    category: 'Service',
    hot: false,
    content: 'PduR（PDU Router）是 Service 层的关键模块，负责在不同通信接口之间路由 PDU 数据。',
  },
  {
    id: 'blog-9',
    title: 'AutoSAR RTE 层接口生成原理与代码分析',
    desc: '解析 RTE 生成器的工作原理，从 ARXML 描述到 C 语言接口代码的完整转换流程。',
    author: '李架构',
    avatar: '李架',
    role: '首席架构师',
    date: '2026-04-12',
    readTime: '22 分钟',
    views: 1650,
    likes: 67,
    comments: 15,
    tags: ['架构设计', 'RTE', '代码生成'],
    category: '架构设计',
    hot: true,
    content: 'RTE（Runtime Environment）是 AutoSAR 软件组件之间的通信接口层，其代码通常由 RTE 生成器根据 ARXML 配置自动生成。',
  },
  {
    id: 'blog-10',
    title: 'MISRA C:2012 规则在汽车软件中的实践应用',
    desc: '结合实际代码案例讲解 MISRA C:2012 中最常被触发的规则，以及如何在开发中避免违规。',
    author: '周审',
    avatar: '周审',
    role: '质量工程师',
    date: '2026-04-11',
    readTime: '11 分钟',
    views: 1340,
    likes: 52,
    comments: 10,
    tags: ['工具链', 'MISRA', '代码质量'],
    category: '工具链',
    hot: false,
    content: 'MISRA C:2012 是汽车嵌入式软件开发中最广泛使用的编码规范，遵循 MISRA 规则可以显著提高代码的安全性和可维护性。',
  },
];

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

const weeklyTop = [
  { title: 'AutoSAR BSW 分层架构深度解析：从 MCAL 到 RTE 的完整数据流', views: 3420 },
  { title: 'ISO 26262 功能安全在 AutoSAR BSW 中的实现要点', views: 2100 },
  { title: 'CAN FD 驱动开发实战：从寄存器到 AutoSAR 接口', views: 1860 },
  { title: 'AutoSAR RTE 层接口生成原理与代码分析', views: 1650 },
  { title: 'CanIf 模块配置最佳实践：信号路由与 PDU 映射', views: 1540 },
];

export function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [allComments, setAllComments] = useLocalStorage<BlogComment[]>('yuletech-blog-comments', []);
  const [likedArticles, setLikedArticles] = useLocalStorage<string[]>('yuletech-blog-liked', []);
  const [articleLikes, setArticleLikes] = useLocalStorage<Record<string, number>>('yuletech-blog-likes', {});
  const [commentContent, setCommentContent] = useState('');
  const currentUser = '我';

  const activeArticle = articlesData.find((a) => a.id === activeArticleId);
  const articleComments = allComments.filter((c) => c.articleId === activeArticleId);

  const getLikes = (articleId: string, baseLikes: number) => {
    return baseLikes + (articleLikes[articleId] || 0);
  };

  const isLiked = (articleId: string) => likedArticles.includes(articleId);

  const handleLikeArticle = (articleId: string) => {
    if (isLiked(articleId)) {
      setLikedArticles((prev) => prev.filter((id) => id !== articleId));
      setArticleLikes((prev) => ({ ...prev, [articleId]: (prev[articleId] || 0) - 1 }));
    } else {
      setLikedArticles((prev) => [...prev, articleId]);
      setArticleLikes((prev) => ({ ...prev, [articleId]: (prev[articleId] || 0) + 1 }));
    }
  };

  const handleAddComment = () => {
    if (!commentContent.trim() || !activeArticleId) return;
    const newComment: BlogComment = {
      id: generateId('bc'),
      articleId: activeArticleId,
      content: commentContent.trim(),
      author: currentUser,
      avatar: '我',
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
    };
    setAllComments((prev) => [...prev, newComment]);
    setCommentContent('');
  };

  const handleLikeComment = (commentId: string) => {
    setAllComments((prev) =>
      prev.map((c) => {
        if (c.id !== commentId) return c;
        const alreadyLiked = c.likedBy.includes(currentUser);
        return {
          ...c,
          likes: alreadyLiked ? c.likes - 1 : c.likes + 1,
          likedBy: alreadyLiked ? c.likedBy.filter((u) => u !== currentUser) : [...c.likedBy, currentUser],
        };
      })
    );
  };

  const filteredArticles = articlesData.filter((a) => {
    const matchCategory = activeCategory === '全部' || a.category === activeCategory;
    const matchSearch =
      searchQuery === '' ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

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
    <div className="min-h-screen pt-16">
      <Helmet>
        <title>技术博客 - YuleTech | AutoSAR BSW 技术文章</title>
        <meta name="description" content="由 YuleTech 技术团队和社区专家撰写的深度技术文章，涵盖 AutoSAR BSW 各层级的开发实践、架构设计与性能优化经验。" />
      </Helmet>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-[hsl(var(--primary))]/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-sm font-medium mb-6">
              <FileText className="w-4 h-4" />
              技术博客
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              AutoSAR
              <span className="text-gradient-accent"> 技术专栏</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              由 YuleTech 技术团队和社区专家撰写的深度技术文章，涵盖 AutoSAR BSW 各层级的
              开发实践、架构设计与性能优化经验。
            </p>
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索文章、标签、作者..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/50 shadow-elegant"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 border-y border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-[hsl(var(--accent))]">120+</div>
              <div className="text-sm text-muted-foreground">技术文章</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[hsl(var(--accent))]">35</div>
              <div className="text-sm text-muted-foreground">社区作者</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[hsl(var(--accent))]">85,000+</div>
              <div className="text-sm text-muted-foreground">月度阅读</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[hsl(var(--accent))]">2,400+</div>
              <div className="text-sm text-muted-foreground">互动讨论</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {!searchQuery && activeCategory === '全部' && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-[hsl(var(--accent))]" />
              <h2 className="text-xl font-bold">编辑推荐</h2>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 hover:border-[hsl(var(--accent))]/30 transition-all hover:shadow-elegant">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {articlesData[0].tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-muted rounded-md text-xs text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3
                    className="text-xl md:text-2xl font-bold mb-3 hover:text-[hsl(var(--accent))] transition-colors cursor-pointer"
                    onClick={() => setActiveArticleId(articlesData[0].id)}
                  >
                    {articlesData[0].title}
                  </h3>
                  <p className="text-muted-foreground mb-4">{articlesData[0].desc}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-xs font-bold">
                        {articlesData[0].avatar}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">{articlesData[0].author}</span>
                        <span className="text-xs ml-1">{articlesData[0].role}</span>
                      </div>
                    </div>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {articlesData[0].readTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> {articlesData[0].views}
                    </span>
                    <button
                      onClick={() => handleLikeArticle(articlesData[0].id)}
                      className={`flex items-center gap-1 transition-colors ${
                        isLiked(articlesData[0].id) ? 'text-[hsl(var(--accent))]' : ''
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> {getLikes(articlesData[0].id, articlesData[0].likes)}
                    </button>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" /> {articlesData[0].comments}
                    </span>
                  </div>
                </div>
                <div className="lg:w-48 flex-shrink-0 flex items-center">
                  <button
                    onClick={() => setActiveArticleId(articlesData[0].id)}
                    className="w-full lg:w-auto px-6 py-3 bg-[hsl(var(--primary))] text-primary-foreground rounded-xl font-semibold hover:bg-[hsl(var(--primary-glow))] transition-all flex items-center justify-center gap-2"
                  >
                    阅读全文
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Filter + Content */}
      <section className="py-8 sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-[hsl(var(--primary))] text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles + Sidebar */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Articles */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">
                  {searchQuery ? `搜索结果："${searchQuery}"` : activeCategory === '全部' ? '最新文章' : `${activeCategory} 文章`}
                </h2>
                <span className="text-sm text-muted-foreground">共 {filteredArticles.length} 篇</span>
              </div>
              {filteredArticles.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>没有找到相关文章</p>
                </div>
              )}
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className="group bg-card border border-border rounded-xl p-5 hover:border-[hsl(var(--accent))]/30 transition-all hover:shadow-elegant"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-muted rounded-md text-xs text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {article.hot && (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                        <Flame className="w-3 h-3" /> 热门
                      </span>
                    )}
                  </div>
                  <h3
                    className="font-semibold text-lg mb-2 group-hover:text-[hsl(var(--accent))] transition-colors cursor-pointer"
                    onClick={() => setActiveArticleId(article.id)}
                  >
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{article.desc}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-[10px] font-bold">
                        {article.avatar}
                      </div>
                      <span className="font-medium text-foreground">{article.author}</span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {article.readTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> {article.views}
                    </span>
                    <button
                      onClick={() => handleLikeArticle(article.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        isLiked(article.id) ? 'text-[hsl(var(--accent))]' : ''
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> {getLikes(article.id, article.likes)}
                    </button>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" /> {article.comments + articleComments.filter((c) => c.articleId === article.id).length}
                    </span>
                    <span className="ml-auto">{article.date}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="lg:w-80 flex-shrink-0 space-y-6">
              {/* Hot Tags */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold mb-4">热门标签</h3>
                <div className="flex flex-wrap gap-2">
                  {hotTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-3 py-1.5 bg-muted rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekly Top */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[hsl(var(--accent))]" />
                  本周热门
                </h3>
                <div className="space-y-3">
                  {weeklyTop.map((item, i) => (
                    <div key={item.title} className="flex items-start gap-3 group cursor-pointer">
                      <span
                        className={`text-sm font-bold w-5 text-center flex-shrink-0 ${
                          i < 3 ? 'text-[hsl(var(--accent))]' : 'text-muted-foreground'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-[hsl(var(--accent))] transition-colors">
                          {item.title}
                        </p>
                        <span className="text-xs text-muted-foreground">{item.views} 阅读</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Authors */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-[hsl(var(--accent))]" />
                  活跃作者
                </h3>
                <div className="space-y-3">
                  {[
                    { name: '李架构', role: '首席架构师', articles: 18 },
                    { name: '张明', role: '嵌入式工程师', articles: 12 },
                    { name: '陈工', role: '功能安全工程师', articles: 9 },
                    { name: '刘洋', role: 'DevOps工程师', articles: 7 },
                  ].map((author) => (
                    <div key={author.name} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-xs font-bold">
                        {author.name.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{author.name}</div>
                        <div className="text-xs text-muted-foreground">{author.role}</div>
                      </div>
                      <span className="text-xs text-muted-foreground">{author.articles} 篇</span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2 text-sm text-[hsl(var(--accent))] hover:text-[hsl(var(--accent-glow))] font-medium flex items-center justify-center gap-1">
                  查看全部作者 <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Write CTA */}
              <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-xl p-5 text-white text-center">
                <FileText className="w-8 h-8 mx-auto mb-3 opacity-90" />
                <h3 className="font-semibold mb-2">成为技术作者</h3>
                <p className="text-sm text-white/80 mb-4">分享你的 AutoSAR 开发经验，与社区共同成长</p>
                <button className="w-full py-2.5 bg-white text-[hsl(var(--primary))] rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors">
                  开始写作
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold pr-4 line-clamp-1">{activeArticle.title}</h2>
              <button
                onClick={() => setActiveArticleId(null)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-xs font-bold">
                    {activeArticle.avatar}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">{activeArticle.author}</span>
                    <span className="text-xs ml-1">{activeArticle.role}</span>
                  </div>
                </div>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {activeArticle.date}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> {activeArticle.views}
                </span>
                <button
                  onClick={() => handleLikeArticle(activeArticle.id)}
                  className={`flex items-center gap-1 transition-colors ${
                    isLiked(activeArticle.id) ? 'text-[hsl(var(--accent))]' : ''
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" /> {getLikes(activeArticle.id, activeArticle.likes)}
                </button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {activeArticle.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-muted rounded-md text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Content */}
              <div>{renderRichContent(activeArticle.content)}</div>

              {/* Comments */}
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold mb-4">
                  评论 ({articleComments.length + activeArticle.comments})
                </h4>
                {articleComments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">暂无评论，来抢沙发吧！</p>
                )}
                <div className="space-y-4">
                  {articleComments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 pl-4 border-l-2 border-border">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {comment.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{comment.author}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{formatTime(comment.createdAt)}</span>
                        </div>
                        <div className="text-sm text-foreground">{renderRichContent(comment.content)}</div>
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className={`flex items-center gap-1 mt-2 text-xs transition-colors ${
                            comment.likedBy.includes(currentUser)
                              ? 'text-[hsl(var(--accent))]'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          {comment.likes}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment Input */}
                <div className="flex gap-3 pt-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[hsl(var(--accent))]/10 flex items-center justify-center text-xs font-bold text-[hsl(var(--accent))]">
                    我
                  </div>
                  <div className="flex-1 flex gap-2">
                    <textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="写下你的评论..."
                      rows={3}
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30 resize-none"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!commentContent.trim()}
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
    </div>
  );
}
