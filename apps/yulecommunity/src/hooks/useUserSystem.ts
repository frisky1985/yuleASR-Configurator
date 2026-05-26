import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { generateId } from '../data/communityData';

export type PointsAction = 'post' | 'reply' | 'answer' | 'accepted' | 'event';

export interface PointsHistoryItem {
  id: string;
  action: PointsAction;
  description: string;
  points: number;
  timestamp: string;
}

export interface UserSystemState {
  points: number;
  history: PointsHistoryItem[];
}

const DEFAULT_ACTION_POINTS: Record<PointsAction, number> = {
  post: 10,
  reply: 5,
  answer: 15,
  accepted: 50,
  event: 20,
};

const ACTION_DESCRIPTIONS: Record<PointsAction, string> = {
  post: '发布帖子',
  reply: '回复帖子',
  answer: '回答问题',
  accepted: '回答被采纳',
  event: '参加活动',
};

export function getActionPoints(): Record<PointsAction, number> {
  try {
    const raw = localStorage.getItem('yuletech-point-rules');
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Record<PointsAction, number>>;
      return { ...DEFAULT_ACTION_POINTS, ...parsed };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_ACTION_POINTS };
}

export interface LevelThreshold {
  level: number;
  title: string;
  min: number;
  max: number;
}

const DEFAULT_LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1, title: '初级工程师', min: 0, max: 100 },
  { level: 2, title: '中级工程师', min: 101, max: 500 },
  { level: 3, title: '高级工程师', min: 501, max: 2000 },
  { level: 4, title: '技术专家', min: 2001, max: Infinity },
];

export function getLevelThresholds(): LevelThreshold[] {
  try {
    const raw = localStorage.getItem('yuletech-level-thresholds');
    if (raw) {
      const parsed = JSON.parse(raw) as LevelThreshold[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((t) => ({
          ...t,
          max: t.max ?? Infinity,
        }));
      }
    }
  } catch {
    // ignore
  }
  return [...DEFAULT_LEVEL_THRESHOLDS];
}

export function getLevelInfo(points: number) {
  const thresholds = getLevelThresholds();
  for (const t of thresholds) {
    if (points >= t.min && (t.max === Infinity || points <= t.max)) {
      return { ...t };
    }
  }
  return { ...thresholds[thresholds.length - 1] };
}

export function useUserSystem() {
  const [state, setState] = useLocalStorage<UserSystemState>('yuletech-user-system', {
    points: 0,
    history: [],
  });

  const addPoints = useCallback((action: PointsAction, description?: string) => {
    const actionPoints = getActionPoints();
    const points = actionPoints[action];
    const item: PointsHistoryItem = {
      id: generateId('pts'),
      action,
      description: description || ACTION_DESCRIPTIONS[action],
      points,
      timestamp: new Date().toISOString(),
    };
    setState((prev) => ({
      points: prev.points + points,
      history: [item, ...prev.history],
    }));
  }, [setState]);

  const setPoints = useCallback((points: number) => {
    setState((prev) => ({
      ...prev,
      points: Math.max(0, points),
    }));
  }, [setState]);

  const levelInfo = getLevelInfo(state.points);

  return {
    points: state.points,
    history: state.history,
    level: levelInfo.level,
    title: levelInfo.title,
    min: levelInfo.min,
    max: levelInfo.max,
    addPoints,
    setPoints,
  };
}

export { DEFAULT_ACTION_POINTS, DEFAULT_LEVEL_THRESHOLDS };
