import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  ArrowLeft, Download, Star, Clock, User, Cpu, Layers,
  GitBranch, AlertCircle, CheckCircle2, ChevronDown, ChevronRight,
  Code, ExternalLink, Tag,
} from 'lucide-react';
import { getRegistryModuleById, fetchRegistryModule } from '../../data/autosar/registry-samples';
import { CompatibilityMatrix } from '../../components/autosar/CompatibilityMatrix';
import { ImportToConfigurator } from '../../components/autosar/ImportToConfigurator';
import { REGISTRY_MODULES } from '../../data/autosar/registry-samples';
import type { RegistryModule } from '../../data/autosar/registry-types';

const layerColorMap: Record<string, string> = {
  MCAL: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  ECUAL: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  Service: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  RTE_ASW: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  Complex: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  System: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
};

const statusMap: Record<string, string> = {
  published: 'bg-green-500/10 text-green-600 dark:text-green-400',
  draft: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  deprecated: 'bg-red-500/10 text-red-600 dark:text-red-400',
  review: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
};

function RatingLarge({ rating, count }: { rating: number; count: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < full
                ? 'fill-amber-400 text-amber-400'
                : i === full && half
                ? 'fill-amber-400/50 text-amber-400'
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
      <span className="text-lg font-bold">{rating.toFixed(1)}</span>
      <span className="text-sm text-muted-foreground">({count} 评价)</span>
    </div>
  );
}

export function RegistryDetailPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [showConfig, setShowConfig] = useState(false);
  const [module, setModule] = useState<RegistryModule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const loadModule = async () => {
      if (!moduleId) { setLoading(false); return; }
      // 尝试后端
      const serverMod = await fetchRegistryModule(moduleId);
      if (serverMod) {
        setModule(serverMod);
        setLoading(false);
        return;
      }
      // 降级到本地
      const localMod = getRegistryModuleById(moduleId);
      setModule(localMod || null);
      setLoading(false);
    };
    loadModule();
  }, [moduleId]);

  const compatibilityModules = useMemo(() => {
    return module ? [module] : [];
  }, [module]);

  const versionHistory = useMemo(() => {
    return [
      { version: '2.1.0', date: '2025-03-20', notes: '支持 CAN FD 灵活数据速率, 修复 Bus-Off 恢复问题' },
      { version: '2.0.0', date: '2024-12-10', notes: '重构协议栈架构, 新增 TCAN 支持' },
      { version: '1.5.0', date: '2024-09-15', notes: '增加 DLC 校验, 优化错误处理' },
      { version: '1.0.0', date: '2024-06-01', notes: '初始版本, 支持 CAN 2.0 通信' },
    ];
  }, []);

  const relatedModules = useMemo(() => {
    if (!module) return [];
    return REGISTRY_MODULES.filter(
      m => m.id !== module.id && (m.layer === module.layer || m.tags.some(t => module.tags.includes(t)))
    ).slice(0, 3);
  }, [module]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">加载模块详情...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">模块未找到</h2>
          <p className="text-muted-foreground mb-6">该模块不存在或已被移除</p>
          <Link
            to="/autosar/registry"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            返回模块仓库
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <Helmet>
        <title>{module.name} - BSW 模块仓库 - YuleTech</title>
        <meta name="description" content={module.description} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <Link
            to="/autosar/registry"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回模块仓库
          </Link>
        </motion.div>

        {/* Module Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10"
        >
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${layerColorMap[module.layer] || ''}`}>
                  {module.layer}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${statusMap[module.status] || ''}`}>
                  {module.status === 'published' ? '已发布' : module.status === 'draft' ? '预览' : module.status === 'deprecated' ? '已弃用' : '审核中'}
                </span>
                <span className="text-xs text-muted-foreground font-mono">v{module.version}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{module.name}</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">{module.description}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {module.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs rounded-full bg-muted/50 text-muted-foreground border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Author & Timestamp */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {module.author}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                更新于 {new Date(module.timestamps.updated).toLocaleDateString('zh-CN')}
              </span>
            </div>

            {/* Rating & Downloads */}
            <div className="flex items-center gap-6">
              <RatingLarge rating={module.stats.rating} count={module.stats.reviewCount} />
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Download className="w-4 h-4" />
                <span className="font-semibold text-foreground">{module.stats.downloads.toLocaleString()}</span>
                次下载
              </div>
            </div>

            {/* MCU Compatibility */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                MCU 兼容性
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {module.compatibility.mcu.map(mcu => (
                  <span
                    key={mcu}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-primary/5 text-primary border border-primary/10"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {mcu}
                  </span>
                ))}
              </div>
            </div>

            {/* Dependencies */}
            {module.dependencies.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5" />
                  依赖
                </h3>
                <div className="flex flex-wrap gap-2">
                  {module.dependencies.map(dep => (
                    <span
                      key={dep.name}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-muted/50 text-muted-foreground border border-border"
                    >
                      {dep.name}
                      <span className="text-[10px] opacity-70">{dep.version}</span>
                      {dep.optional && <span className="text-[10px] text-amber-500">(可选)</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Import Button */}
            <div className="p-5 rounded-xl bg-card border border-border">
              <ImportToConfigurator
                configData={module.configData}
                moduleName={module.name}
              />
              <p className="text-xs text-muted-foreground mt-2">
                将模块配置一键导入 yuleASR 配置器进行深度定制
              </p>
            </div>

            {/* Quick Info */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">模块信息</h3>
              {[
                { label: '层级', value: module.layer },
                { label: '版本', value: `v${module.version}` },
                { label: '创建时间', value: new Date(module.timestamps.created).toLocaleDateString('zh-CN') },
                { label: '最近更新', value: new Date(module.timestamps.updated).toLocaleDateString('zh-CN') },
                { label: '状态', value: module.status === 'published' ? '已发布' : module.status === 'draft' ? '预览版' : module.status === 'deprecated' ? '已弃用' : '审核中' },
              ].map(info => (
                <div key={info.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{info.label}</span>
                  <span className="font-medium">{info.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Config Data Preview */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group"
          >
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              <span className="font-medium">.yuleasr.json 配置预览</span>
              <span className="text-xs text-muted-foreground">
                ({JSON.stringify(module.configData).length} 字符)
              </span>
            </div>
            {showConfig ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {showConfig && (
            <div className="mt-2 rounded-xl overflow-hidden border border-border">
              <SyntaxHighlighter
                language="json"
                style={oneDark}
                customStyle={{ margin: 0, padding: '20px', fontSize: '13px', maxHeight: '480px' }}
                showLineNumbers
              >
                {module.configData}
              </SyntaxHighlighter>
            </div>
          )}
        </motion.div>

        {/* Compatibility Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-10"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            兼容性矩阵
          </h2>
          <div className="rounded-xl bg-card border border-border p-4">
            <CompatibilityMatrix modules={compatibilityModules} mode="mcu" />
          </div>
        </motion.div>

        {/* Version History */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            版本历史
          </h2>
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">版本</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">发布日期</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">更新说明</th>
                </tr>
              </thead>
              <tbody>
                {versionHistory.map((ver, i) => (
                  <tr
                    key={ver.version}
                    className="border-b border-border/50 last:border-b-0 hover:bg-muted/10 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-sm font-medium">
                      v{ver.version}
                      {i === 0 && (
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-green-500/10 text-green-600 dark:text-green-400">
                          最新
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{ver.date}</td>
                    <td className="px-4 py-3 text-muted-foreground">{ver.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Rating & Comments (Static) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-10"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            社区评价
          </h2>
          <div className="rounded-xl bg-card border border-border p-6 text-center">
            <div className="mb-4">
              <Star className="w-10 h-10 text-amber-400 fill-amber-400 mx-auto mb-2" />
              <div className="text-3xl font-bold">{module.stats.rating.toFixed(1)}</div>
              <p className="text-sm text-muted-foreground">{module.stats.reviewCount} 条评价</p>
            </div>
            <p className="text-sm text-muted-foreground">
              评价功能将在后续版本中开放，敬请期待
            </p>
          </div>
        </motion.div>

        {/* Related Modules */}
        {relatedModules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-primary" />
              相关模块
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedModules.map(rel => (
                <Link
                  key={rel.id}
                  to={`/autosar/registry/${rel.id}`}
                  className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-elegant transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full border ${layerColorMap[rel.layer] || ''}`}>
                      {rel.layer}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                    {rel.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {rel.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Download className="w-3 h-3" />
                    {rel.stats.downloads.toLocaleString()}
                    <Star className="w-3 h-3 ml-1" />
                    {rel.stats.rating.toFixed(1)}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
