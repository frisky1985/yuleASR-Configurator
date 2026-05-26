import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  AlertTriangle,
  Award,
  Search,
  ChevronRight,
} from 'lucide-react';
import {
  moduleQualityData,
  qualityBadges,
  getScoreColor,
  getScoreBg,
  type QualityMetric,
  type ModuleQuality,
} from '../data/quality';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

function QualityRadarChart({ metrics }: { metrics: QualityMetric[] }) {
  const data = metrics.map(m => ({
    metric: m.name,
    score: m.score,
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="metric"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
        />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name="质量评分"
          dataKey="score"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.3}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function ModuleQualityCard({
  module,
  isExpanded,
  onToggle,
}: {
  module: ModuleQuality;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const earnedBadges = qualityBadges.filter(b => module.badges.includes(b.id));

  return (
    <motion.div
      layout
      className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold ${getScoreBg(module.overallScore)} text-white`}>
              {module.overallScore}
            </div>
            <div>
              <h3 className="text-lg font-bold">{module.moduleName}</h3>
              <p className="text-sm text-muted-foreground">版本 {module.version} · 分析于 {module.lastAnalyzed}</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          {earnedBadges.slice(0, 4).map(badge => (
            <span
              key={badge.id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
              title={badge.description}
            >
              <span>{badge.icon}</span>
              {badge.name}
            </span>
          ))}
          {earnedBadges.length > 4 && (
            <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">
              +{earnedBadges.length - 4}
            </span>
          )}
        </div>

        {/* Metrics */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 pt-6 border-t border-border"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-4">质量指标详情</h4>
                <div className="space-y-4">
                  {module.metrics.map(metric => (
                    <div key={metric.name}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{metric.name}</span>
                        <span className={`font-medium ${getScoreColor(metric.score)}`}>
                          {metric.score}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getScoreBg(metric.score)}`}
                          style={{ width: `${metric.score}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-4">质量雷达图</h4>
                <QualityRadarChart metrics={module.metrics} />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export function QualityPage() {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'excellent' | 'good' | 'needs-improvement'>('all');

  const filteredModules = useMemo(() => {
    let modules = moduleQualityData;

    if (search) {
      modules = modules.filter(m =>
        m.moduleName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filter === 'excellent') {
      modules = modules.filter(m => m.overallScore >= 90);
    } else if (filter === 'good') {
      modules = modules.filter(m => m.overallScore >= 70 && m.overallScore < 90);
    } else if (filter === 'needs-improvement') {
      modules = modules.filter(m => m.overallScore < 70);
    }

    return modules.sort((a, b) => b.overallScore - a.overallScore);
  }, [search, filter]);

  const stats = useMemo(() => {
    const total = moduleQualityData.length;
    const excellent = moduleQualityData.filter(m => m.overallScore >= 90).length;
    const good = moduleQualityData.filter(m => m.overallScore >= 70 && m.overallScore < 90).length;
    const avgScore = Math.round(
      moduleQualityData.reduce((sum, m) => sum + m.overallScore, 0) / total
    );
    return { total, excellent, good, avgScore };
  }, []);

  return (
    <div className="min-h-screen pt-16">
      <Helmet>
        <title>代码质量 - YuleTech | 模块质量评分</title>
      </Helmet>

      {/* Hero */}
      <section className="relative py-16 overflow-hidden bg-gradient-to-b from-[hsl(var(--primary))]/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-sm font-medium mb-6"
            >
              <ShieldCheck className="w-4 h-4" />
              质量保障
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
            >
              代码质量评分
              <span className="text-gradient-accent"> 系统</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-3xl mx-auto"
            >
              基于多维度指标自动评估代码质量，包括代码规范、测试覆盖、安全检查、性能分析和文档完整性。
              帮助团队保持高质量的代码基准。
            </motion.p>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">已评分模块</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-500">{stats.excellent}</div>
              <div className="text-sm text-muted-foreground">优秀模块</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-500">{stats.good}</div>
              <div className="text-sm text-muted-foreground">良好模块</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-primary">{stats.avgScore}</div>
              <div className="text-sm text-muted-foreground">平均分数</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Badge Gallery */}
      <section className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Award className="w-8 h-8 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">质量徽章</h2>
            <p className="text-muted-foreground">每个徽章代表达到了特定的质量标准</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {qualityBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/30 transition-colors"
                title={badge.description}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <h4 className="font-medium text-sm mb-1">{badge.name}</h4>
                <p className="text-xs text-muted-foreground">≥{badge.minScore}分</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Module List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索模块..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              {[
                { id: 'all', label: '全部' },
                { id: 'excellent', label: '优秀' },
                { id: 'good', label: '良好' },
                { id: 'needs-improvement', label: '待改进' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border hover:border-primary/30'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Module Cards */}
          <div className="space-y-4">
            {filteredModules.map((module) => (
              <ModuleQualityCard
                key={module.moduleId}
                module={module}
                isExpanded={expandedId === module.moduleId}
                onToggle={() => setExpandedId(
                  expandedId === module.moduleId ? null : module.moduleId
                )}
              />
            ))}
          </div>

          {filteredModules.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">没有找到符合条件的模块</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
