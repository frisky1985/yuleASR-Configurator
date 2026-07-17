/**
 * CodeDiffPreview — Modal showing diff between generated code and saved code
 *
 * Shows side-by-side or unified diff using a simple LCS-based algorithm.
 * When no saved code exists, shows "首次生成" placeholder.
 */

import { X, FileCode, FileDiff, CheckCircle2 } from 'lucide-react';
import { useMemo } from 'react';

import { cn } from '@/lib/utils';

// ── LCS-based line diff ──────────────────────────────────────────────

type DiffOp = 'equal' | 'insert' | 'delete';

interface DiffLine {
  op: DiffOp;
  text: string;
  oldLine: number | null;
  newLine: number | null;
}

function computeLineDiff(oldLines: string[], newLines: string[]): DiffLine[] {
  // Build LCS table
  const m = oldLines.length;
  const n = newLines.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build diff
  let i = m,
    j = n;
  const temp: DiffLine[] = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      temp.push({ op: 'equal', text: oldLines[i - 1], oldLine: i, newLine: j });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      temp.push({ op: 'insert', text: newLines[j - 1], oldLine: null, newLine: j });
      j--;
    } else {
      temp.push({ op: 'delete', text: oldLines[i - 1], oldLine: i, newLine: null });
      i--;
    }
  }
  return temp.reverse();
}

// ── Props ──

interface CodeDiffPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  generatedCode: string;
  savedCode: string | null;
  moduleName: string;
}

export function CodeDiffPreview({
  isOpen,
  onClose,
  generatedCode,
  savedCode,
  moduleName,
}: CodeDiffPreviewProps) {
  const isFirstGeneration = !savedCode;

  const { diffLines, addedLines, removedLines } = useMemo(() => {
    if (isFirstGeneration || !savedCode) {
      return {
        diffLines: generatedCode.split('\n').map((text, i) => ({
          op: 'insert' as DiffOp,
          text,
          oldLine: null,
          newLine: i + 1,
        })),
        addedLines: generatedCode.split('\n').length,
        removedLines: 0,
      };
    }
    const old = savedCode.split('\n');
    const neu = generatedCode.split('\n');
    const lines = computeLineDiff(old, neu);
    const added = lines.filter(l => l.op === 'insert').length;
    const removed = lines.filter(l => l.op === 'delete').length;
    return { diffLines: lines, addedLines: added, removedLines: removed };
  }, [generatedCode, savedCode, isFirstGeneration]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-app-bg-primary rounded-xl shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-app-border-primary shrink-0">
          <div className="flex items-center gap-3">
            <FileDiff className="w-5 h-5 text-app-text-secondary" />
            <h2 className="text-lg font-semibold text-app-text-primary">
              代码差异预览 — {moduleName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-app-text-tertiary hover:text-app-text-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats bar */}
        {!isFirstGeneration && (
          <div className="flex items-center gap-4 px-6 py-2 bg-app-bg-secondary border-b border-app-border-primary text-sm">
            <span className="text-app-text-secondary">
              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-green-500" />
              {diffLines.filter(l => l.op === 'equal').length} 行未变更
            </span>
            <span className="text-green-600 font-medium">+{addedLines}</span>
            <span className="text-red-500 font-medium">-{removedLines}</span>
            <span className="text-app-text-tertiary ml-auto">共 {diffLines.length} 行</span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-auto p-0">
          {isFirstGeneration ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-primary-900/30">
                <FileCode className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-lg font-medium text-app-text-primary mb-2">首次生成代码</h3>
              <p className="text-sm text-app-text-secondary mb-6">
                暂无已保存的代码可供对比。以下是本次生成的完整代码。
              </p>
              <pre className="text-left bg-app-bg-secondary rounded-lg p-4 overflow-x-auto max-h-80 text-xs font-mono leading-relaxed text-app-text-primary whitespace-pre-wrap">
                {generatedCode}
              </pre>
            </div>
          ) : (
            <table className="w-full border-collapse font-mono text-xs leading-relaxed">
              <thead>
                <tr className="bg-app-bg-secondary sticky top-0 z-10">
                  <th className="w-12 text-right px-2 py-1 text-app-text-tertiary border-r border-app-border-primary">
                    旧
                  </th>
                  <th className="w-12 text-left px-2 py-1 text-app-text-tertiary">新</th>
                  <th className="px-4 py-1 text-left text-app-text-tertiary">代码</th>
                </tr>
              </thead>
              <tbody>
                {diffLines.map((line, i) => (
                  <tr
                    key={i}
                    className={cn(
                      'hover:bg-app-bg-secondary/50 transition-colors',
                      line.op === 'delete' && 'bg-red-50/30',
                      line.op === 'insert' && 'bg-green-50/30'
                    )}
                  >
                    <td
                      className={cn(
                        'w-12 text-right px-2 py-0.5 select-none border-r border-app-border-primary',
                        line.op === 'delete'
                          ? 'text-red-500 bg-red-50/50'
                          : 'text-app-text-tertiary',
                        line.op === 'insert' && 'text-app-text-tertiary'
                      )}
                    >
                      {line.oldLine ?? ''}
                    </td>
                    <td
                      className={cn(
                        'w-12 text-left px-2 py-0.5 select-none',
                        line.op === 'insert'
                          ? 'text-green-600 bg-green-50/50'
                          : 'text-app-text-tertiary',
                        line.op === 'delete' && 'text-app-text-tertiary'
                      )}
                    >
                      {line.newLine ?? ''}
                    </td>
                    <td
                      className={cn(
                        'px-4 py-0.5 whitespace-pre',
                        line.op === 'delete' && 'text-red-600 bg-red-50/30',
                        line.op === 'insert' && 'text-green-700 bg-green-50/30',
                        line.op === 'equal' && 'text-app-text-primary'
                      )}
                    >
                      {line.op === 'delete' && (
                        <span className="mr-2 text-red-400 select-none">−</span>
                      )}
                      {line.op === 'insert' && (
                        <span className="mr-2 text-green-500 select-none">+</span>
                      )}
                      {line.text}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-app-border-primary shrink-0 bg-app-bg-secondary">
          <div className="flex items-center gap-3 text-xs text-app-text-tertiary">
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-100 border border-green-300 dark:bg-green-900/50 dark:border-green-700" /> 新增
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-50 border border-red-300 dark:bg-red-950/40 dark:border-red-700" /> 删除
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-app-bg-primary border border-app-border-primary" />{' '}
              未变更
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium text-app-text-primary border border-app-border-primary rounded-lg hover:bg-app-bg-primary transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

export default CodeDiffPreview;
