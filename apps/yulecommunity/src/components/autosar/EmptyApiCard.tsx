import { BookOpen } from 'lucide-react';

export function EmptyApiCard() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted/20 flex items-center justify-center mb-4">
        <BookOpen className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">选择一个 API</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        从左侧树形导航中选择一个模块和 API 函数，<br />
        查看其完整规范说明、参数详情和代码示例。
      </p>
      <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
        <kbd className="px-2 py-0.5 rounded border border-border bg-muted/50">←</kbd>
        <span>或使用</span>
        <kbd className="px-2 py-0.5 rounded border border-border bg-muted/50">Cmd + K</kbd>
        <span>全局搜索</span>
      </div>
    </div>
  );
}
