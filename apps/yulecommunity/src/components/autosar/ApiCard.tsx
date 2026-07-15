import { useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronDown, ChevronRight, Copy, Check, ExternalLink,
  BookOpen, Code2, ArrowRight, Info, Clock, Star,
} from 'lucide-react';
import type { AutosarApi } from '../../data/autosar/types';
import { LAYERS } from '../../data/autosar/spec-index';
import { useBookmarks } from '../../hooks/autosar/useBookmarks';

const CodeBlock = lazy(() => import('./CodeBlock'));

const layerColors: Record<string, string> = {
  MCAL: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  ECUAL: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  Service: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  RTE_ASW: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

const statusColors: Record<string, string> = {
  standard: 'bg-green-500/10 text-green-600 dark:text-green-400',
  optional: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  deprecated: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

interface ApiCardProps {
  api: AutosarApi;
}

export function ApiCard({ api }: ApiCardProps) {
  const [showExample, setShowExample] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const layerInfo = LAYERS.find(l => l.id === api.layerId);
  const { toggleBookmark, isBookmarked } = useBookmarks();

  const copyExample = () => {
    navigator.clipboard.writeText(api.example);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-xl font-bold font-mono">{api.name}</h2>
          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${layerColors[api.layerId] || ''}`}>
            {api.layerId}
          </span>
          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${statusColors[api.status]}`}>
            {api.status === 'standard' ? '标准' : api.status === 'optional' ? '可选' : '弃用'}
          </span>
          <button
            onClick={() => toggleBookmark(api.id)}
            className="p-1.5 rounded-md hover:bg-muted/50 transition-colors"
            title={isBookmarked(api.id) ? '取消收藏' : '收藏'}
          >
            {isBookmarked(api.id)
              ? <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              : <Star className="w-4 h-4 text-muted-foreground" />
            }
          </button>
          <button
            onClick={copyShareLink}
            className="ml-auto p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            title="分享链接"
          >
            {shareCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          {shareCopied && (
            <span className="text-[10px] text-green-500 font-medium">已复制链接</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{api.brief}</p>
      </div>

      {/* Full Description */}
      <div className="bg-muted/20 rounded-lg p-4 border border-border">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm leading-relaxed">{api.description}</p>
        </div>
      </div>

      {/* Function Signature */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5" />
          函数签名
        </h3>
        <div className="bg-[#1e1e1e] dark:bg-[#1e1e1e] rounded-lg p-3 overflow-x-auto">
          <Suspense fallback={<pre className="text-sm font-mono text-gray-300" style={{ margin: 0, padding: 0, fontSize: '13px', background: 'transparent' }}><code>{api.signature}</code></pre>}>
            <CodeBlock
              language="c"
              customStyle={{ background: 'transparent', padding: 0, margin: 0, fontSize: '13px' }}
              wrapLongLines
            >
              {api.signature}
            </CodeBlock>
          </Suspense>
        </div>
      </div>

      {/* Parameters Table */}
      {api.params.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            参数 ({api.params.length})
          </h3>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">参数名</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">类型</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">方向</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">说明</th>
                </tr>
              </thead>
              <tbody>
                {api.params.map((param, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10">
                    <td className="px-3 py-2 font-mono text-xs font-medium">{param.name}</td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{param.type}</td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        param.direction === 'in' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                        param.direction === 'out' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                        'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                      }`}>
                        {param.direction === 'in' ? '输入' : param.direction === 'out' ? '输出' : '输入/输出'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{param.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Return Value */}
      <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/10 border border-border">
        <div className="shrink-0">
          <ArrowRight className="w-4 h-4 text-primary" />
        </div>
        <div>
          <span className="text-xs font-semibold text-muted-foreground">返回值</span>
          <p className="font-mono text-sm mt-0.5">{api.returnType}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{api.returnDescription}</p>
        </div>
      </div>

      {/* Timing */}
      {api.timing && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-muted-foreground">执行时间</span>
            <p className="text-xs text-muted-foreground mt-0.5">{api.timing}</p>
          </div>
        </div>
      )}

      {/* Run in Sandbox Button */}
      <Link
        to={`/autosar/sandbox?example=${api.name}`}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
      >
        🚀 在沙盒中运行
      </Link>

      {/* Code Example */}
      <div className="rounded-lg border border-border overflow-hidden">
        <button
          onClick={() => setShowExample(!showExample)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-muted/20 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">代码示例</span>
            {api.exampleDescription && (
              <span className="text-xs text-muted-foreground">— {api.exampleDescription}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {showExample && (
              <button
                onClick={(e) => { e.stopPropagation(); copyExample(); }}
                className="p-1 rounded hover:bg-muted/50 transition-colors"
                title="复制代码"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
            {showExample ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </button>
        {showExample && (
          <div className="border-t border-border">
            <Suspense fallback={<div className="p-4 text-xs text-muted-foreground">加载语法高亮...</div>}>
              <CodeBlock
                language="c"
                customStyle={{ margin: 0, padding: '16px', fontSize: '13px' }}
                showLineNumbers
              >
                {api.example}
              </CodeBlock>
            </Suspense>
          </div>
        )}
      </div>

      {/* See Also & Config Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {api.seeAlso.length > 0 && (
          <div className="p-3 rounded-lg bg-muted/10 border border-border">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
              <ExternalLink className="w-3 h-3" />
              关联 API
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {api.seeAlso.map(ref => (
                <div key={ref} className="flex items-center gap-0.5">
                  <Link
                    to={`/autosar/spec/${api.moduleId}/${ref}`}
                    className="px-2 py-1 text-xs rounded-md bg-primary/5 text-primary hover:bg-primary/10 transition-colors font-mono"
                  >
                    {ref}
                  </Link>
                  <Link
                    to={`/autosar/sandbox?example=${ref}`}
                    className="p-1 rounded-md hover:bg-primary/10 text-primary/60 hover:text-primary transition-colors"
                    title="在沙盒中查看"
                  >
                    ▶
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
        {api.configParams && api.configParams.length > 0 && (
          <div className="p-3 rounded-lg bg-muted/10 border border-border">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" />
              配置参数
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {api.configParams.map(cfg => (
                <Link
                  key={cfg.paramName}
                  to={`/yuleasr`}
                  className="px-2 py-1 text-xs rounded-md bg-amber-500/5 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors font-mono"
                >
                  {cfg.paramName}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Version info */}
      <div className="text-[11px] text-muted-foreground border-t border-border pt-3 flex items-center gap-4">
        <span>AUTOSAR {api.version}</span>
        <span>{api.moduleId} 模块</span>
        <span>{layerInfo?.name || api.layerId}</span>
      </div>
    </motion.div>
  );
}
