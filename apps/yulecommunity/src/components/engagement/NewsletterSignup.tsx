/**
 * Newsletter 订阅组件
 * @description 邮件订阅表单 - 支持 Inline、Article-end、Popup 三种变体
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, Check, Loader2, Sparkles, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// 邮箱验证正则
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Storage Keys
const SUBSCRIBED_KEY = 'yuletech:newsletter:subscribed';
const EMAIL_KEY = 'yuletech:newsletter:email';
const POPUP_SHOWN_KEY = 'yuletech:newsletter:popup-shown';

// 组件变体类型
type NewsletterVariant = 'inline' | 'article-end' | 'popup';

// 基础 Props
interface BaseNewsletterProps {
  variant: NewsletterVariant;
  className?: string;
}

// Inline 变体
interface InlineNewsletterProps extends BaseNewsletterProps {
  variant: 'inline';
  title?: string;
  description?: string;
}

// 文章结尾变体
interface ArticleEndNewsletterProps extends BaseNewsletterProps {
  variant: 'article-end';
  articleTitle?: string;
}

// 弹窗变体
interface PopupNewsletterProps extends BaseNewsletterProps {
  variant: 'popup';
  delay?: number;
  enableExitIntent?: boolean;
}

type NewsletterSignupProps = InlineNewsletterProps | ArticleEndNewsletterProps | PopupNewsletterProps;

/**
 * 验证邮箱格式
 */
function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Inline 版订阅组件
 */
function InlineSignup({ className }: { className?: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubscribed, setIsSubscribed] = useLocalStorage(SUBSCRIBED_KEY, false);
  const [savedEmail, setSavedEmail] = useLocalStorage(EMAIL_KEY, '');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setStatus('error');
      setErrorMessage('请输入有效的邮箱地址');
      return;
    }

    setStatus('loading');

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 保存订阅状态
    setIsSubscribed(true);
    setSavedEmail(email);
    setStatus('success');
  }, [email, setIsSubscribed, setSavedEmail]);

  if (isSubscribed) {
    return (
      <div className={cn(
        "flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800",
        className
      )}>
        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="font-medium text-green-900 dark:text-green-100">
            订阅成功！
          </p>
          <p className="text-sm text-green-700 dark:text-green-300">
            我们已将 {savedEmail} 添加到订阅列表
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20",
      className
    )}>
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1">订阅技术周报</h3>
          <p className="text-sm text-muted-foreground">
            每周精选 AutoSAR 干货，独家教程 + 源码解读 + 行业动态
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Input
            type="email"
            placeholder="输入您的邮箱地址"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === 'error') setStatus('idle');
            }}
            className={cn(
              "h-11",
              status === 'error' && "border-red-500 focus-visible:ring-red-500"
            )}
            disabled={status === 'loading'}
            aria-invalid={status === 'error'}
            aria-describedby={status === 'error' ? 'email-error' : undefined}
          />
          {status === 'error' && (
            <p id="email-error" className="text-xs text-red-500 mt-1 absolute">
              {errorMessage}
            </p>
          )}
        </div>
        <Button 
          type="submit" 
          className="h-11 px-6"
          disabled={status === 'loading' || !email}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              订阅中...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              立即订阅
            </>
          )}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground mt-3">
        🔒 无垃圾邮件，随时取消订阅。我们尊重您的隐私。
      </p>
    </div>
  );
}

/**
 * 文章结尾版订阅组件
 */
function ArticleEndSignup({ articleTitle, className }: { articleTitle?: string; className?: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isSubscribed, setIsSubscribed] = useLocalStorage(SUBSCRIBED_KEY, false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;

    setStatus('loading');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubscribed(true);
    setStatus('success');
  }, [email, setIsSubscribed]);

  if (isSubscribed) {
    return (
      <div className={cn(
        "flex items-center gap-3 p-4 bg-muted rounded-lg",
        className
      )}>
        <Check className="w-5 h-5 text-green-500" />
        <span className="text-sm">感谢订阅！您将在第一时间收到最新文章。</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-6 bg-card border rounded-xl",
      className
    )}>
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-5 h-5 text-primary" />
        <h4 className="font-semibold">喜欢这篇文章？</h4>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        {articleTitle 
          ? `订阅我们的周报，获取更多像「${articleTitle}」这样的优质内容。`
          : '订阅我们的周报，获取更多 AutoSAR 技术干货。'
        }
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="输入邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10"
          disabled={status === 'loading'}
        />
        <Button 
          type="submit" 
          size="sm"
          disabled={status === 'loading' || !email}
        >
          {status === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            '订阅'
          )}
        </Button>
      </form>
    </div>
  );
}

/**
 * 弹窗版订阅组件
 */
function PopupSignup({ delay = 10000, enableExitIntent = true }: { delay?: number; enableExitIntent?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isSubscribed, setIsSubscribed] = useLocalStorage(SUBSCRIBED_KEY, false);
  const [popupShown, setPopupShown] = useLocalStorage(POPUP_SHOWN_KEY, false);
  const exitIntentRef = useRef(false);

  // 延迟显示弹窗
  useEffect(() => {
    if (isSubscribed || popupShown) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      setPopupShown(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, isSubscribed, popupShown, setPopupShown]);

  // 退出意图检测
  useEffect(() => {
    if (!enableExitIntent || isSubscribed || popupShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 10 && !exitIntentRef.current) {
        exitIntentRef.current = true;
        setIsOpen(true);
        setPopupShown(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [enableExitIntent, isSubscribed, popupShown, setPopupShown]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;

    setStatus('loading');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubscribed(true);
    setStatus('success');
    
    // 2秒后关闭弹窗
    setTimeout(() => setIsOpen(false), 2000);
  }, [email, setIsSubscribed]);

  // 已订阅不显示弹窗
  if (isSubscribed) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* 弹窗内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-background border rounded-xl shadow-xl p-6"
          >
            {/* 关闭按钮 */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>

            {/* 标题 */}
            <h3 className="text-lg font-semibold text-center mb-2 flex items-center justify-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              加入 YuleTech 技术社区
            </h3>

            <div className="text-center py-4">
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="py-8"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">订阅成功！</h3>
                    <p className="text-muted-foreground">
                      感谢您的订阅，我们将第一时间为您送上精彩内容。
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-muted-foreground mb-6">
                      订阅我们的周报，获取 AutoSAR 最新技术文章、源码解读和行业动态。
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <Input
                        type="email"
                        placeholder="输入您的邮箱地址"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 text-base"
                        disabled={status === 'loading'}
                      />
                      <Button 
                        type="submit" 
                        className="w-full h-12"
                        disabled={status === 'loading' || !email}
                      >
                        {status === 'loading' ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            处理中...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            免费订阅
                          </>
                        )}
                      </Button>
                    </form>

                    <p className="text-xs text-muted-foreground mt-4">
                      每周一封，无垃圾邮件，随时取消。
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * NewsletterSignup 主组件
 */
export function NewsletterSignup(props: NewsletterSignupProps) {
  switch (props.variant) {
    case 'inline':
      return <InlineSignup className={props.className} />;
    case 'article-end':
      return <ArticleEndSignup articleTitle={props.articleTitle} className={props.className} />;
    case 'popup':
      return <PopupSignup delay={props.delay} enableExitIntent={props.enableExitIntent} />;
    default:
      return null;
  }
}

export default NewsletterSignup;
