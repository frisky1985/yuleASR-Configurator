/**
 * 积分显示组件
 * @description 用户积分和等级展示
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, TrendingUp, Award, Loader2 } from 'lucide-react';
import { usePoints } from '@/hooks/usePoints';
import { Progress } from '@/components/ui/progress';

interface PointsDisplayProps {
  /** 是否显示详细信息 */
  detailed?: boolean;
}

export function PointsDisplay({ detailed = false }: PointsDisplayProps) {
  const { points, level, title, progress, max, isLoading, isAuthenticated } = usePoints();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="animate-pulse p-6 bg-card rounded-xl">
        <div className="h-16 bg-muted rounded-lg" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 bg-card rounded-xl">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const levelColors = [
    'text-gray-500',
    'text-green-500',
    'text-blue-500',
    'text-purple-500',
    'text-orange-500',
    'text-red-500',
    'text-yellow-500',
  ];

  const levelColor = levelColors[level - 1] || levelColors[0];
  const nextLevelPoints = max === Infinity ? null : max;

  return (
    <div className="space-y-4">
      {/* 积分卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full bg-background ${levelColor}`}>
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">总积分</p>
              <p className="text-2xl font-bold">{points.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-background ${levelColor}`}>
              <Star className="w-4 h-4" />
              <span className="font-medium">Lv.{level}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{title}</p>
          </div>
        </div>

        {/* 等级进度 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">等级进度</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          {nextLevelPoints && (
            <p className="text-xs text-muted-foreground text-right">
              距下一等级还需 {(nextLevelPoints - points).toLocaleString()} 积分
            </p>
          )}
        </div>

        {/* 未登录提示 */}
        {!isAuthenticated && (
          <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg text-sm text-yellow-600 dark:text-yellow-400">
            登录后可将积分同步到云端，参与排行榜
          </div>
        )}
      </motion.div>

      {/* 详细信息 */}
      {detailed && (
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl p-4 border"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">当前等级</span>
            </div>
            <p className="text-xl font-bold">Lv.{level}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl p-4 border"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Award className="w-4 h-4" />
              <span className="text-sm">总积分</span>
            </div>
            <p className="text-xl font-bold">{points.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">继续加油！</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default PointsDisplay;
