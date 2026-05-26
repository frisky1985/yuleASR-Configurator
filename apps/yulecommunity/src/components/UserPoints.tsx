import { Award, Star, TrendingUp } from 'lucide-react';
import { useUserSystem, getLevelInfo } from '../hooks/useUserSystem';

interface UserPointsProps {
  showHistory?: boolean;
}

export function UserPoints({ showHistory = false }: UserPointsProps) {
  const user = useUserSystem();
  const levelInfo = getLevelInfo(user.points);
  const nextLevelMin = levelInfo.max === Infinity ? levelInfo.min : levelInfo.max + 1;
  const prevLevelMax = levelInfo.min;
  const range = nextLevelMin - prevLevelMax;
  const progress = Math.min(100, Math.max(0, ((user.points - prevLevelMax) / range) * 100));

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-bold">{user.points}</div>
            <div className="text-sm text-muted-foreground">当前积分</div>
          </div>
          <div className="ml-auto text-right">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] text-sm font-medium">
              <Star className="w-3.5 h-3.5" />
              {user.title}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Lv.{levelInfo.level}</div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">等级进度</span>
            <span className="font-medium">{user.points} / {levelInfo.max === Infinity ? '∞' : levelInfo.max}</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{levelInfo.title}</span>
            <span>{levelInfo.max === Infinity ? '已满级' : getLevelInfo(levelInfo.max + 1).title}</span>
          </div>
        </div>
      </div>

      {showHistory && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[hsl(var(--accent))]" />
            积分记录
          </h3>
          {user.history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">暂无积分记录，快去社区互动吧！</p>
          ) : (
            <div className="space-y-3">
              {user.history.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                  <div>
                    <div className="text-sm font-medium">{item.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString('zh-CN')}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-500">+{item.points}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
