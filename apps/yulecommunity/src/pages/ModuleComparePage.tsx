import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  Star,
  GitFork,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCode,
  BarChart3,
  X,
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { allModulesList } from '../data/modules';

const layerColors: Record<string, string> = {
  MCAL: 'bg-blue-500/10 text-blue-500',
  ECUAL: 'bg-cyan-500/10 text-cyan-500',
  Service: 'bg-teal-500/10 text-teal-500',
  RTE: 'bg-emerald-500/10 text-emerald-500',
};

export function ModuleComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const moduleIds = searchParams.get('modules')?.split(',') || [];
  const [showRadar, setShowRadar] = useState(true);

  const modules = useMemo(() => {
    return moduleIds
      .map(id => allModulesList.find(m => m.id === id))
      .filter(Boolean)
      .map(m => ({
        ...m!,
        // Generate mock metrics for comparison
        metrics: {
          apis: Math.floor(Math.random() * 30) + 10,
          complexity: Math.floor(Math.random() * 40) + 20,
          coverage: Math.floor(Math.random() * 30) + 70,
          performance: Math.floor(Math.random() * 30) + 70,
          docs: Math.floor(Math.random() * 40) + 60,
        },
      }));
  }, [moduleIds]);

  const radarData = useMemo(() => {
    const dimensions = ['API数量', '复杂度', '覆盖率', '性能', '文档'];
    return dimensions.map((dim, i) => {
      const data: Record<string, number | string> = { dimension: dim };
      modules.forEach(m => {
        data[m.name] = Object.values(m.metrics)[i];
      });
      return data;
    });
  }, [modules]);

  const colors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];

  const removeModule = (id: string) => {
    const newIds = moduleIds.filter(mid => mid !== id);
    if (newIds.length === 0) {
      window.location.href = '/#/opensource';
      return;
    }
    setSearchParams({ modules: newIds.join(',') });
  };

  const exportComparison = () => {
    const data = {
      timestamp: new Date().toISOString(),
      modules: modules.map(m => ({
        name: m.name,
        layer: m.layer,
        status: m.status,
        version: m.version,
        stars: m.stars,
        forks: m.forks,
        metrics: m.metrics,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `module-comparison-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (modules.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">没有选择模块</h1>
          <Link to="/opensource" className="text-primary hover:underline">
            返回开源代码页面
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>模块对比 | YuleTech Community</title>
      </Helmet>

      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/opensource"
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">模块对比</h1>
                <p className="text-muted-foreground text-sm">
                  对比 {modules.length} 个模块的详细指标
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowRadar(!showRadar)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showRadar ? 'bg-primary/10 border-primary/20 text-primary' : 'border-border hover:bg-muted'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                雷达图
              </button>
              <button
                onClick={exportComparison}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                导出报告
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Radar Chart */}
        {showRadar && modules.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6 mb-8"
          >
            <h2 className="text-lg font-semibold mb-4">综合能力对比</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  {modules.map((m, i) => (
                    <Radar
                      key={m.id}
                      name={m.name}
                      dataKey={m.name}
                      stroke={colors[i % colors.length]}
                      fill={colors[i % colors.length]}
                      fillOpacity={0.2}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Comparison Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">对比项</th>
                  {modules.map((module) => (
                    <th key={module.id} className="p-4 min-w-[180px]">
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <div className="font-semibold text-lg">{module.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${layerColors[module.layer] || 'bg-muted'}`}>
                              {module.layer}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeModule(module.id)}
                          className="p-1 hover:bg-muted rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="p-4 text-muted-foreground">状态</td>
                  {modules.map((m) => (
                    <td key={m.id} className="p-4">
                      <span className={`inline-flex items-center gap-1.5 text-sm ${
                        m.status === '已完成' ? 'text-green-500' :
                        m.status === '开发中' ? 'text-amber-500' : 'text-muted-foreground'
                      }`}>
                        {m.status === '已完成' ? <CheckCircle2 className="w-4 h-4" /> :
                         m.status === '开发中' ? <Clock className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {m.status}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 text-muted-foreground">版本</td>
                  {modules.map((m) => (
                    <td key={m.id} className="p-4 font-medium">{m.version || '-'}</td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 text-muted-foreground">GitHub Stars</td>
                  {modules.map((m) => (
                    <td key={m.id} className="p-4">
                      <span className="inline-flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-500" />
                        {m.stars}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 text-muted-foreground">Forks</td>
                  {modules.map((m) => (
                    <td key={m.id} className="p-4">
                      <span className="inline-flex items-center gap-1.5">
                        <GitFork className="w-4 h-4" />
                        {m.forks}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 text-muted-foreground">API数量</td>
                  {modules.map((m) => (
                    <td key={m.id} className="p-4">
                      <span className="inline-flex items-center gap-1.5">
                        <FileCode className="w-4 h-4" />
                        {m.metrics.apis}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 text-muted-foreground">测试覆盖率</td>
                  {modules.map((m) => (
                    <td key={m.id} className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[100px]">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${m.metrics.coverage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{m.metrics.coverage}%</span>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 text-muted-foreground">复杂度评分</td>
                  {modules.map((m) => (
                    <td key={m.id} className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        m.metrics.complexity < 30 ? 'bg-green-500/10 text-green-500' :
                        m.metrics.complexity < 50 ? 'bg-amber-500/10 text-amber-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {m.metrics.complexity < 30 ? '简单' :
                         m.metrics.complexity < 50 ? '中等' : '复杂'}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 text-muted-foreground">描述</td>
                  {modules.map((m) => (
                    <td key={m.id} className="p-4 text-sm text-muted-foreground max-w-[200px]">
                      {m.shortDesc}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4"></td>
                  {modules.map((m) => (
                    <td key={m.id} className="p-4">
                      <Link
                        to={`/modules/${m.id}`}
                        className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                      >
                        查看详情 →
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
