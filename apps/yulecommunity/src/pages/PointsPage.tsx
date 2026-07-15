/**
 * PointsPage — 积分中心
 *
 * 功能:
 * - 每日签到 (已登录) / 显示等级和积分 (未登录)
 * - 等级进度条
 * - 排行榜
 * - 积分历史
 */
import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Trophy, Star, Award, TrendingUp, Calendar, CheckCircle2,
  Loader2, AlertCircle, Users, Medal, ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePoints } from '../hooks/usePoints';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../services/userApi';
import { Progress } from '../components/ui/progress';

const LEVEL_CONFIG = [
  { level: 1, title: '新手', min: 0, max: 100 },
  { level: 2, title: '学徒', min: 100, max: 300 },
  { level: 3, title: '工程师', min: 300, max: 600 },
  { level: 4, title: '高级工程师', min: 600, max: 1000 },
  { level: 5, title: '专家', min: 1000, max: 2000 },
  { level: 6, title: '大牛', min: 2000, max: 5000 },
  { level: 7, title: '传说', min: 5000, max: Infinity },
];

const levelColors = [
  'text-gray-500', 'text-green-500', 'text-blue-500',
  'text-purple-500', 'text-orange-500', 'text-red-500', 'text-yellow-500',
];

const medalColors = ['text-yellow-500', 'text-gray-400', 'text-amber-700'];

/** 积分规则条目 */
interface PointsRule {
  action: string;
  points: number;
  note: string;
}

/** 排行榜条目 */
interface LeaderEntry {
  userId: string;
  username: string;
  total: number;
}

/** 签到状态 */
interface CheckinState {
  checkedIn: boolean;
  streak: number;
  today: string;
}

export function PointsPage() {
  const { isAuthenticated } = useAuth();
  const { points, level, title, progress, max, isLoading: ptsLoading, refreshPoints } = usePoints();
  const navigate = useNavigate();

  const [checkin, setCheckin] = useState<CheckinState | null>(null);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinMsg, setCheckinMsg] = useState('');

  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [leadersLoading, setLeadersLoading] = useState(false);

  const [pointsRules, setPointsRules] = useState<PointsRule[] | null>(null);
  const [rulesLoading, setRulesLoading] = useState(false);

  // 加载签到状态
  useEffect(() => {
    if (!isAuthenticated) return;
    userApi.getCheckinStatus().then(res => {
      if (res.success) setCheckin(res.data);
    }).catch(() => {});
  }, [isAuthenticated]);

  // 加载排行榜和积分规则
  useEffect(() => {
    setLeadersLoading(true);
    userApi.getLeaderboard({ limit: 50 }).then(res => {
      if (res.success) setLeaders(res.data);
    }).catch(() => {}).finally(() => setLeadersLoading(false));

    userApi.getPointsRules().then(res => {
      if (res.success) {
        const actionLabels: Record<string, string> = {
          'daily.login': '每日签到',
          'article.read': '阅读文章',
          'article.like': '点赞文章',
          'article.comment': '评论文章',
          'article.publish': '发布文章',
          'build.success': '构建成功',
          'module.published': '发布模块',
        };
        const rules = Object.entries(res.data).map(([action, cfg]) => ({
          action: actionLabels[action] || action,
          points: cfg.points,
          note: cfg.dailyLimit ? `每天最多${cfg.dailyLimit}次` : ''
        }));
        setPointsRules(rules);
      }
    }).catch(() => {});
  }, []);

  const handleCheckin = useCallback(async () => {
    if (!isAuthenticated || checkinLoading || checkin?.checkedIn) return;
    setCheckinLoading(true);
    setCheckinMsg('');
    try {
      const res = await userApi.earnDailyCheckin();
      if (res.success) {
        setCheckin({ checkedIn: true, streak: (checkin?.streak || 0) + 1, today: new Date().toISOString().slice(0, 10) });
        setCheckinMsg('签到成功！+5 积分');
        refreshPoints();
      } else {
        setCheckinMsg(res.message || '签到失败');
      }
    } catch {
      setCheckinMsg('签到失败，请稍后重试');
    } finally {
      setCheckinLoading(false);
    }
  }, [isAuthenticated, checkinLoading, checkin, refreshPoints]);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-background to-muted/20">
      <Helmet>
        <title>积分中心 - YuleTech</title>
        <meta name="description" content="积分体系、每日签到和排行榜" />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 头部 */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            积分中心
          </h1>
          <p className="text-sm text-muted-foreground mt-1">通过贡献获取积分，提升等级，赢取社区声望</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* 左侧：积分卡片 + 签到 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 积分总览卡片 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20"
            >
              {ptsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">总积分</p>
                      <p className="text-3xl font-bold">{points.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-background ${levelColors[level - 1] || levelColors[0]}`}>
                        <Star className="w-4 h-4" />
                        <span className="font-semibold">Lv.{level}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{title}</p>
                    </div>
                  </div>

                  {/* 等级进度 */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {LEVEL_CONFIG[level - 1]?.min.toLocaleString()} → {max === Infinity ? '∞' : max.toLocaleString()}
                      </span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2.5" />
                    {max !== Infinity && (
                      <p className="text-xs text-muted-foreground">
                        距下一等级还需 {(max - points).toLocaleString()} 积分
                      </p>
                    )}
                  </div>

                  {/* 未登录提示 */}
                  {!isAuthenticated && (
                    <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg text-sm text-yellow-600 dark:text-yellow-400">
                      登录后每日签到获取积分，参与排行榜
                    </div>
                  )}
                </>
              )}
            </motion.div>

            {/* 每日签到卡片 */}
            {isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-xl p-6 border border-border"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">每日签到</h3>
                      <p className="text-sm text-muted-foreground">
                        {checkin?.checkedIn
                          ? `今日已签到 · 连续 ${checkin.streak} 天`
                          : '签到 +5 积分'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckin}
                    disabled={checkin?.checkedIn || checkinLoading}
                    className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      checkin?.checkedIn
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 cursor-default'
                        : 'bg-primary text-primary-foreground hover:opacity-90 active:scale-95 shadow-sm'
                    }`}
                  >
                    {checkinLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : checkin?.checkedIn ? (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        已签到
                      </span>
                    ) : (
                      '签到'
                    )}
                  </button>
                </div>

                {checkinMsg && (
                  <p className={`mt-3 text-sm ${checkinMsg.includes('失败') ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
                    {checkinMsg}
                  </p>
                )}

                {/* 签到日历（最近7天简化版） */}
                {checkin && (
                  <div className="mt-4 flex items-center gap-2">
                    {Array.from({ length: 7 }, (_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() - (6 - i));
                      const dStr = d.toISOString().slice(0, 10);
                      const isToday = dStr === checkin.today;
                      const isChecked = checkin.checkedIn && isToday;
                      // 我们可以从 streak 推断但简化：只显示今天
                      return (
                        <div
                          key={i}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors ${
                            isToday && checkin.checkedIn
                              ? 'bg-green-500 text-white'
                              : isToday
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-muted/30 text-muted-foreground/40'
                          }`}
                        >
                          {d.getDate()}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* 等级一览 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-card rounded-xl p-6 border border-border"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                等级一览
              </h3>
              <div className="space-y-2">
                {LEVEL_CONFIG.map((cfg) => {
                  const isCurrent = cfg.level === level;
                  const isUnlocked = cfg.level <= level;
                  return (
                    <div
                      key={cfg.level}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${
                        isCurrent
                          ? 'bg-primary/5 border border-primary/20'
                          : isUnlocked
                          ? 'bg-muted/10'
                          : 'opacity-40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          isUnlocked
                            ? `${levelColors[cfg.level - 1]} bg-background`
                            : 'bg-muted/30 text-muted-foreground/50'
                        }`}>
                          {cfg.level}
                        </span>
                        <div>
                          <span className="text-sm font-medium">{cfg.title}</span>
                          <span className="text-[10px] text-muted-foreground ml-2">
                            {cfg.min}–{cfg.max === Infinity ? '∞' : cfg.max} 分
                          </span>
                        </div>
                      </div>
                      {isCurrent && <span className="text-xs text-primary font-medium">当前</span>}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* 右侧：排行榜 */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Medal className="w-4 h-4 text-amber-500" />
                  积分排行榜
                </h3>
                {leaders.length > 0 && (
                  <span className="text-[10px] text-muted-foreground">{leaders.length} 人</span>
                )}
              </div>

              <div className="divide-y divide-border/50 max-h-[600px] overflow-y-auto">
                {leadersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : leaders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">暂无排行数据</p>
                    <p className="text-xs mt-1">签到获取积分，成为榜首</p>
                  </div>
                ) : (
                  leaders.map((entry, i) => (
                    <div
                      key={entry.userId}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-muted/10 transition-colors"
                    >
                      {/* 排名 */}
                      <div className="w-6 text-center">
                        {i < 3 ? (
                          <Medal className={`w-4 h-4 mx-auto ${medalColors[i]}`} />
                        ) : (
                          <span className="text-xs text-muted-foreground font-mono">{i + 1}</span>
                        )}
                      </div>

                      {/* 用户名 */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{entry.username}</p>
                      </div>

                      {/* 积分 */}
                      <div className="text-right">
                        <span className="text-sm font-semibold tabular-nums">{entry.total.toLocaleString()}</span>
                        <span className="text-[10px] text-muted-foreground ml-1">分</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* 积分获取指引 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-card rounded-xl p-5 border border-border"
            >
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                获取积分
              </h4>
              <div className="space-y-2 text-sm">
                {(pointsRules || [
                  { action: '每日签到', points: 5, note: '每天1次' },
                  { action: '阅读文章', points: 1, note: '每天最多50篇' },
                  { action: '点赞文章', points: 2, note: '每天最多20个' },
                  { action: '评论文章', points: 5, note: '每天最多10次' },
                  { action: '发布文章', points: 50, note: '' },
                  { action: '构建成功', points: 10, note: '每天最多20次' },
                  { action: '发布模块', points: 100, note: '' },
                ]).map(item => (
                  <div key={item.action} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{item.action}</span>
                    <div className="text-right">
                      <span className="font-medium tabular-nums">+{item.points}</span>
                      {item.note && <span className="text-[10px] text-muted-foreground ml-1">{item.note}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
