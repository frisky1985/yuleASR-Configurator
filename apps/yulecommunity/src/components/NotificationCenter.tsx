import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, MessageSquare, HelpCircle, Calendar, Star } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import type { NotificationType } from '../hooks/useNotifications';

const typeConfig: Record<NotificationType, { icon: typeof MessageSquare; color: string; bg: string; label: string }> = {
  reply: { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10', label: '回复' },
  answer: { icon: HelpCircle, color: 'text-amber-500', bg: 'bg-amber-500/10', label: '回答' },
  event_start: { icon: Calendar, color: 'text-green-500', bg: 'bg-green-500/10', label: '活动' },
  points_change: { icon: Star, color: 'text-purple-500', bg: 'bg-purple-500/10', label: '积分' },
};

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClick = (notif: typeof notifications[0]) => {
    if (!notif.read) markAsRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted relative"
        aria-label="通知"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">通知中心</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[hsl(var(--accent))] hover:text-[hsl(var(--accent-glow))] flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                全部已读
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>暂无通知</p>
              </div>
            )}
            {notifications.map((notif) => {
              const config = typeConfig[notif.type];
              const Icon = config.icon;
              return (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0 flex gap-3 ${!notif.read ? 'bg-muted/30' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
                      {!notif.read && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
                    </div>
                    <div className="text-sm font-medium line-clamp-1">{notif.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{notif.message}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
