import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  MapPinned,
  CheckCircle2,
  X,
  Plus,
  Search,
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useUserSystem } from '../hooks/useUserSystem';
import { useNotifications } from '../hooks/useNotifications';
import { initialEvents, generateId, type CommunityEvent } from '../data/communityData';

const typeFilters = [
  { label: '全部', value: 'all' },
  { label: '线上', value: 'online' },
  { label: '线下', value: 'offline' },
];

const statusFilters = [
  { label: '全部', value: 'all' },
  { label: '即将开始', value: 'upcoming' },
  { label: '进行中', value: 'ongoing' },
  { label: '已结束', value: 'ended' },
];

export function EventsPage() {
  const [events, setEvents] = useLocalStorage<CommunityEvent[]>('yuletech-events', initialEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'online' as 'online' | 'offline',
    date: '',
    time: '',
    location: '',
    description: '',
    speaker: '',
    speakerRole: '',
    maxAttendees: 100,
    tags: '',
  });
  const currentUser = '我';
  const { addPoints } = useUserSystem();
  const { addNotification } = useNotifications();
  const notifiedEventsRef = useRef<Set<string>>(new Set());

  const filteredEvents = events.filter((evt) => {
    const matchSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === 'all' || evt.type === typeFilter;
    const matchStatus = statusFilter === 'all' || evt.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const handleRegister = (eventId: string) => {
    const evt = events.find((e) => e.id === eventId);
    const alreadyRegistered = evt?.attendees.includes(currentUser);
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e;
        const registered = e.attendees.includes(currentUser);
        if (registered) {
          return { ...e, attendees: e.attendees.filter((a) => a !== currentUser) };
        }
        if (e.attendees.length >= e.maxAttendees) return e;
        return { ...e, attendees: [...e.attendees, currentUser] };
      })
    );
    if (evt && !alreadyRegistered && evt.attendees.length < evt.maxAttendees && evt.status !== 'ended') {
      addPoints('event', `报名活动：${evt.title}`);
      addNotification({
        type: 'event_start',
        title: '活动报名成功',
        message: `你已报名《${evt.title}》，记得准时参加`,
        link: '/events',
      });
    }
  };

  const handleCreateEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date || !newEvent.time || !newEvent.description.trim()) return;
    const tags = newEvent.tags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);
    const evt: CommunityEvent = {
      id: generateId('evt'),
      title: newEvent.title.trim(),
      type: newEvent.type,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location.trim() || undefined,
      description: newEvent.description.trim(),
      speaker: newEvent.speaker.trim() || currentUser,
      speakerRole: newEvent.speakerRole.trim() || '社区成员',
      maxAttendees: newEvent.maxAttendees,
      attendees: [],
      tags: tags.length ? tags : ['活动'],
      status: 'upcoming',
    };
    setEvents((prev) => [evt, ...prev]);
    setNewEvent({
      title: '',
      type: 'online',
      date: '',
      time: '',
      location: '',
      description: '',
      speaker: '',
      speakerRole: '',
      maxAttendees: 100,
      tags: '',
    });
    setShowNewEvent(false);
  };

  useEffect(() => {
    events.forEach((evt) => {
      if (evt.status !== 'upcoming' || notifiedEventsRef.current.has(evt.id)) return;
      const eventDate = new Date(evt.date);
      const now = new Date();
      const diffDays = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays >= 0 && diffDays <= 3) {
        addNotification({
          type: 'event_start',
          title: '活动即将开始',
          message: `《${evt.title}》将在 ${evt.date} 开始，记得参加`,
          link: '/events',
        });
        notifiedEventsRef.current.add(evt.id);
      }
    });
  }, [events, addNotification]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return (
          <span className="px-2 py-0.5 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] rounded-full text-[10px] font-bold">
            即将开始
          </span>
        );
      case 'ongoing':
        return (
          <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full text-[10px] font-bold">
            进行中
          </span>
        );
      case 'ended':
        return (
          <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-[10px] font-bold">
            已结束
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <Helmet>
        <title>社区活动 - YuleTech | 线上研讨会与线下Meetup</title>
        <meta name="description" content="参加 YuleTech 线上技术沙龙、线下研讨会和实战训练营。与行业专家面对面交流，拓展技术视野。" />
      </Helmet>
      {/* Header */}
      <div className="bg-gradient-to-br from-muted/50 to-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">社区活动</h1>
              <p className="text-muted-foreground">线上技术沙龙、线下研讨会、实战训练营</p>
            </div>
            <button
              onClick={() => setShowNewEvent(true)}
              className="inline-flex items-center gap-2 bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--primary-glow))] transition-colors px-5 py-2.5 rounded-lg font-medium self-start"
            >
              <Plus className="w-4 h-4" />
              发布活动
            </button>
          </div>

          {/* Search & Filters */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索活动..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {typeFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === f.value
                    ? 'bg-[hsl(var(--accent))] text-white'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
            <div className="w-px h-6 bg-border mx-1 self-center" />
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
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

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const isRegistered = evt.attendees.includes(currentUser);
            const isFull = evt.attendees.length >= evt.maxAttendees;
            const isEnded = evt.status === 'ended';
            return (
              <div
                key={evt.id}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-[hsl(var(--accent))]/30 hover:shadow-elegant transition-all flex flex-col"
              >
                {/* Event Header */}
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {evt.type === 'online' ? (
                        <Video className="w-4 h-4 text-[hsl(var(--accent))]" />
                      ) : (
                        <MapPinned className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-xs text-muted-foreground">{evt.type === 'online' ? '线上' : '线下'}</span>
                    </div>
                    {getStatusBadge(evt.status)}
                  </div>

                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{evt.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{evt.description}</p>

                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{evt.time}</span>
                    </div>
                    {evt.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{evt.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        {evt.attendees.length} / {evt.maxAttendees} 人已报名
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-[10px] font-bold">
                      {evt.speaker.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-medium">{evt.speaker}</span>
                      <span className="text-xs text-muted-foreground ml-1">{evt.speakerRole}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {evt.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-muted rounded-full text-[10px] text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action */}
                <div className="p-4 border-t border-border bg-muted/20">
                  {isEnded ? (
                    <button
                      disabled
                      className="w-full py-2 text-sm font-medium text-muted-foreground bg-muted rounded-lg cursor-not-allowed"
                    >
                      活动已结束
                    </button>
                  ) : isRegistered ? (
                    <button
                      onClick={() => handleRegister(evt.id)}
                      className="w-full py-2 text-sm font-medium text-green-600 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors"
                    >
                      <span className="flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        已报名
                      </span>
                    </button>
                  ) : isFull ? (
                    <button
                      disabled
                      className="w-full py-2 text-sm font-medium text-muted-foreground bg-muted rounded-lg cursor-not-allowed"
                    >
                      名额已满
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegister(evt.id)}
                      className="w-full py-2 text-sm font-medium bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--primary-glow))] rounded-lg transition-colors"
                    >
                      立即报名
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>没有找到相关活动</p>
          </div>
        )}
      </div>

      {/* New Event Modal */}
      {showNewEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">发布活动</h2>
              <button onClick={() => setShowNewEvent(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">活动标题</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="活动名称"
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">活动类型</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as 'online' | 'offline' })}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
                  >
                    <option value="online">线上</option>
                    <option value="offline">线下</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">人数上限</label>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={newEvent.maxAttendees}
                    onChange={(e) => setNewEvent({ ...newEvent, maxAttendees: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">日期</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">时间</label>
                  <input
                    type="text"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    placeholder="例如：20:00 - 21:30"
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">地点 / 链接</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder={newEvent.type === 'online' ? '腾讯会议 / B站直播 / Zoom' : '详细地址'}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">活动描述</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="活动详情介绍..."
                  rows={4}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">主讲人</label>
                  <input
                    type="text"
                    value={newEvent.speaker}
                    onChange={(e) => setNewEvent({ ...newEvent, speaker: e.target.value })}
                    placeholder="姓名"
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">主讲人职位</label>
                  <input
                    type="text"
                    value={newEvent.speakerRole}
                    onChange={(e) => setNewEvent({ ...newEvent, speakerRole: e.target.value })}
                    placeholder="职位"
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">标签（用逗号分隔）</label>
                <input
                  type="text"
                  value={newEvent.tags}
                  onChange={(e) => setNewEvent({ ...newEvent, tags: e.target.value })}
                  placeholder="例如：BSW, 技术分享, 培训"
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
                />
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => setShowNewEvent(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateEvent}
                disabled={!newEvent.title.trim() || !newEvent.date || !newEvent.time || !newEvent.description.trim()}
                className="px-5 py-2 bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--primary-glow))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-lg text-sm font-medium"
              >
                发布活动
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
