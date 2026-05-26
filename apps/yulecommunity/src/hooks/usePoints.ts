/**
 * 积分系统 Hook - 云端同步版
 * @description 支持 localStorage 本地存储和 API 云端同步
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useAuth } from './useAuth';
import { userApi, type PointsInfo } from '@/services/userApi';

export type PointsAction = 
  | 'article.read'
  | 'article.like'
  | 'article.bookmark'
  | 'article.share'
  | 'article.comment'
  | 'article.publish'
  | 'build.success'
  | 'build.share'
  | 'pr.merged'
  | 'issue.created'
  | 'issue.resolved'
  | 'module.published'
  | 'daily.login'
  | 'profile.complete'
  | 'invite.user';

interface LocalPointsState {
  points: number;
  history: Array<{
    id: string;
    action: PointsAction;
    description: string;
    points: number;
    timestamp: string;
  }>;
  lastSyncAt: string | null;
}

const POINTS_KEY = 'yuletech:points';

interface LevelInfo {
  level: number;
  title: string;
  min: number;
  max: number;
  progress: number;
}

// 等级配置
const LEVEL_CONFIG = [
  { level: 1, title: '新手', min: 0, max: 100 },
  { level: 2, title: '学徒', min: 100, max: 300 },
  { level: 3, title: '工程师', min: 300, max: 600 },
  { level: 4, title: '高级工程师', min: 600, max: 1000 },
  { level: 5, title: '专家', min: 1000, max: 2000 },
  { level: 6, title: '大牛', min: 2000, max: 5000 },
  { level: 7, title: '传说', min: 5000, max: Infinity },
];

function calculateLevel(points: number): LevelInfo {
  for (const config of LEVEL_CONFIG) {
    if (points >= config.min && points < config.max) {
      const progress = Math.floor(((points - config.min) / (config.max - config.min)) * 100);
      return { ...config, progress };
    }
  }
  return { ...LEVEL_CONFIG[LEVEL_CONFIG.length - 1], progress: 100 };
}

export function usePoints() {
  const { isAuthenticated, token } = useAuth();
  const [localState, setLocalState] = useLocalStorage<LocalPointsState>(POINTS_KEY, {
    points: 0,
    history: [],
    lastSyncAt: null,
  });
  const [cloudInfo, setCloudInfo] = useState<PointsInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialSyncDone = useRef(false);

  // 设置 API token
  useEffect(() => {
    userApi.setToken(token);
  }, [token]);

  // 初始化：登录后获取云端积分
  useEffect(() => {
    if (!isAuthenticated || initialSyncDone.current) return;

    const fetchCloudPoints = async () => {
      setIsLoading(true);
      try {
        const response = await userApi.getPoints();
        if (response.success) {
          setCloudInfo(response.data);
        }
      } catch (err) {
        console.error('获取云端积分失败:', err);
        setError('获取积分信息失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCloudPoints();
    initialSyncDone.current = true;
  }, [isAuthenticated]);

  // 当前积分和等级
  const { points, level, title, min, max, progress } = useMemo(() => {
    if (isAuthenticated && cloudInfo) {
      return {
        points: cloudInfo.total,
        level: cloudInfo.level.current,
        title: cloudInfo.level.title,
        min: LEVEL_CONFIG[cloudInfo.level.current - 1]?.min || 0,
        max: cloudInfo.level.nextLevelPoints || Infinity,
        progress: cloudInfo.level.progress,
      };
    }
    const levelInfo = calculateLevel(localState.points);
    return {
      points: localState.points,
      level: levelInfo.level,
      title: levelInfo.title,
      min: levelInfo.min,
      max: levelInfo.max,
      progress: levelInfo.progress,
    };
  }, [isAuthenticated, cloudInfo, localState.points]);

  // 积分历史
  const history = useMemo(() => {
    if (isAuthenticated && cloudInfo) {
      return (cloudInfo as any).history || [];
    }
    return localState.history;
  }, [isAuthenticated, cloudInfo, localState.history]);

  /**
   * 增加积分
   */
  const addPoints = useCallback(async (
    action: PointsAction,
    description?: string,
    reference?: { type: string; id: string; title: string }
  ) => {
    // 更新本地
    const pointsChange = getPointsForAction(action);
    const historyItem = {
      id: `pts_${Date.now()}`,
      action,
      description: description || getDefaultDescription(action),
      points: pointsChange,
      timestamp: new Date().toISOString(),
    };

    setLocalState(prev => ({
      points: prev.points + pointsChange,
      history: [historyItem, ...prev.history].slice(0, 100),
      lastSyncAt: prev.lastSyncAt,
    }));

    // 如果已登录，同步到云端
    if (isAuthenticated) {
      try {
        const result = await userApi.earnPoints(action, reference);
        if (result.success) {
          // 刷新云端积分信息
          const pointsResponse = await userApi.getPoints();
          if (pointsResponse.success) {
            setCloudInfo(pointsResponse.data);
          }
        }
      } catch (err) {
        console.error('同步积分到云端失败:', err);
      }
    }
  }, [isAuthenticated, setLocalState]);

  /**
   * 手动刷新积分
   */
  const refreshPoints = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await userApi.getPoints();
      if (response.success) {
        setCloudInfo(response.data);
      }
    } catch (err) {
      console.error('刷新积分失败:', err);
      setError('刷新积分失败');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * 设置积分（管理员调整用）
   */
  const setPoints = useCallback((newPoints: number) => {
    setLocalState(prev => ({
      ...prev,
      points: Math.max(0, newPoints),
    }));
  }, [setLocalState]);

  return {
    points,
    level,
    title,
    min,
    max,
    progress,
    history,
    isLoading,
    error,
    isAuthenticated,
    addPoints,
    setPoints,
    refreshPoints,
  };
}

// 获取动作默认积分
function getPointsForAction(action: PointsAction): number {
  const pointsMap: Record<PointsAction, number> = {
    'article.read': 1,
    'article.like': 2,
    'article.bookmark': 3,
    'article.share': 5,
    'article.comment': 5,
    'article.publish': 50,
    'build.success': 10,
    'build.share': 5,
    'pr.merged': 50,
    'issue.created': 5,
    'issue.resolved': 20,
    'module.published': 100,
    'daily.login': 5,
    'profile.complete': 20,
    'invite.user': 30,
  };
  return pointsMap[action] || 0;
}

// 获取默认描述
function getDefaultDescription(action: PointsAction): string {
  const descriptions: Record<PointsAction, string> = {
    'article.read': '阅读文章',
    'article.like': '点赞文章',
    'article.bookmark': '收藏文章',
    'article.share': '分享文章',
    'article.comment': '评论文章',
    'article.publish': '发布文章',
    'build.success': '构建成功',
    'build.share': '分享构建',
    'pr.merged': 'PR 合并',
    'issue.created': '创建 Issue',
    'issue.resolved': '解决 Issue',
    'module.published': '发布模块',
    'daily.login': '每日登录',
    'profile.complete': '完善资料',
    'invite.user': '邀请用户',
  };
  return descriptions[action] || '获得积分';
}

export default usePoints;
