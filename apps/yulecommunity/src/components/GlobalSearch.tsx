import { useState, useRef, useEffect } from 'react';
import { Search, X, FileText, MessageSquare, HelpCircle, Calendar, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { initialForumPosts, initialQuestions, initialEvents } from '../data/communityData';
import { articlesData } from '../pages/BlogPage';
import { searchCode } from '../data/codeSearch';
import type { ForumPost, Question, CommunityEvent } from '../data/communityData';

type SearchResult = {
  id: string;
  title: string;
  excerpt: string;
  type: 'forum' | 'qa' | 'blog' | 'event' | 'code';
  link: string;
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cmd/Ctrl + K 快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const results: SearchResult[] = [];
  const q = query.trim().toLowerCase();

  if (q.length >= 1) {
    const posts = readStorage<ForumPost[]>('yuletech-forum-posts', initialForumPosts);
    const questions = readStorage<Question[]>('yuletech-qa-questions', initialQuestions);
    const events = readStorage<CommunityEvent[]>('yuletech-events', initialEvents);

    posts.forEach((post) => {
      if (post.title.toLowerCase().includes(q) || post.content.toLowerCase().includes(q)) {
        results.push({
          id: post.id,
          title: post.title,
          excerpt: post.content.slice(0, 60) + (post.content.length > 60 ? '...' : ''),
          type: 'forum',
          link: '/forum',
        });
      }
    });

    questions.forEach((question) => {
      if (question.title.toLowerCase().includes(q) || question.content.toLowerCase().includes(q)) {
        results.push({
          id: question.id,
          title: question.title,
          excerpt: question.content.slice(0, 60) + (question.content.length > 60 ? '...' : ''),
          type: 'qa',
          link: '/qa',
        });
      }
    });

    articlesData.forEach((article) => {
      if (
        article.title.toLowerCase().includes(q) ||
        article.desc.toLowerCase().includes(q) ||
        article.content.toLowerCase().includes(q)
      ) {
        results.push({
          id: article.id,
          title: article.title,
          excerpt: article.desc.slice(0, 60) + (article.desc.length > 60 ? '...' : ''),
          type: 'blog',
          link: '/blog',
        });
      }
    });

    events.forEach((evt) => {
      if (evt.title.toLowerCase().includes(q) || evt.description.toLowerCase().includes(q)) {
        results.push({
          id: evt.id,
          title: evt.title,
          excerpt: evt.description.slice(0, 60) + (evt.description.length > 60 ? '...' : ''),
          type: 'event',
          link: '/events',
        });
      }
    });

    // 代码搜索
    const codeResults = searchCode(q);
    codeResults.forEach((item) => {
      results.push({
        id: `code-${item.id}`,
        title: item.signature || item.name,
        excerpt: item.description,
        type: 'code',
        link: `/opensource/${item.module.toLowerCase()}`,
      });
    });
  }

  const handleSelect = (link: string) => {
    navigate(link);
    setIsOpen(false);
    setQuery('');
  };

  const typeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'forum': return '论坛';
      case 'qa': return '问答';
      case 'blog': return '博客';
      case 'event': return '活动';
      case 'code': return '代码';
      default: return type;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
        aria-label="搜索"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                placeholder="搜索帖子、问答、文章、活动、代码..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
              />
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {results.length === 0 && q.length >= 1 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                没有找到相关结果
              </div>
            )}
            {results.length === 0 && q.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                输入关键词开始搜索
              </div>
            )}
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleSelect(result.link)}
                className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0"
              >
                <div className="flex items-center gap-2 mb-1">
                  {result.type === 'forum' && <MessageSquare className="w-3.5 h-3.5 text-blue-500" />}
                  {result.type === 'qa' && <HelpCircle className="w-3.5 h-3.5 text-amber-500" />}
                  {result.type === 'blog' && <FileText className="w-3.5 h-3.5 text-cyan-500" />}
                  {result.type === 'event' && <Calendar className="w-3.5 h-3.5 text-green-500" />}
                  {result.type === 'code' && <Code className="w-3.5 h-3.5 text-purple-500" />}
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    {typeLabel(result.type)}
                  </span>
                </div>
                <div className="text-sm font-medium line-clamp-1">{result.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{result.excerpt}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
