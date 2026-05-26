import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Star,
  GitFork,
  ExternalLink,
  BookOpen,
  Download,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Database,
  Radio,
  Search,
  ArrowRight,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Code2,
  Scale,
} from 'lucide-react';
import { useGitHubRepos } from '../hooks/useGitHubRepos';
import { DependencyGraph } from '../components/DependencyGraph';
import { TestCoverageDashboard } from '../components/TestCoverageDashboard';
import { useModuleCompare } from '../hooks/useModuleCompare';
import { ModuleCompareBar } from '../components/ModuleCompareBar';

const layerFilters = ['全部', 'MCAL', 'ECUAL', 'Service', 'RTE + ASW'];

interface StaticModuleItem {
  name: string;
  status: string;
  version: string;
  stars: number;
  forks: number;
  docs: boolean;
  desc: string;
}

interface StaticModuleGroup {
  category: string;
  layer: string;
  icon: React.ElementType;
  color: string;
  badgeColor: string;
  desc: string;
  items: StaticModuleItem[];
}

const staticModules: StaticModuleGroup[] = [
  {
    category: 'MCAL',
    layer: 'MCAL',
    icon: Cpu,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    badgeColor: 'bg-blue-500/10 text-blue-500',
    desc: '微控制器驱动层 - 直接操作硬件寄存器',
    items: [
      { name: 'Mcu', status: '已完成', version: 'v1.2.0', stars: 48, forks: 12, docs: true, desc: '微控制器驱动，负责时钟、复位和功耗管理' },
      { name: 'Port', status: '已完成', version: 'v1.1.0', stars: 42, forks: 10, docs: true, desc: '端口驱动，配置引脚功能和方向' },
      { name: 'Dio', status: '已完成', version: 'v1.1.0', stars: 38, forks: 8, docs: true, desc: '数字IO驱动，读写引脚电平状态' },
      { name: 'Can', status: '已完成', version: 'v1.3.0', stars: 56, forks: 18, docs: true, desc: 'CAN控制器驱动，支持CAN FD协议' },
      { name: 'Spi', status: '已完成', version: 'v1.2.0', stars: 44, forks: 11, docs: true, desc: 'SPI串行外设接口驱动' },
      { name: 'Gpt', status: '已完成', version: 'v1.1.0', stars: 35, forks: 7, docs: true, desc: '通用定时器驱动' },
      { name: 'Pwm', status: '已完成', version: 'v1.1.0', stars: 32, forks: 6, docs: true, desc: '脉宽调制驱动' },
      { name: 'Adc', status: '已完成', version: 'v1.2.0', stars: 40, forks: 9, docs: true, desc: '模数转换驱动' },
      { name: 'Wdg', status: '已完成', version: 'v1.0.0', stars: 28, forks: 5, docs: true, desc: '看门狗驱动' },
    ],
  },
  {
    category: 'ECUAL',
    layer: 'ECUAL',
    icon: Layers,
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    badgeColor: 'bg-cyan-500/10 text-cyan-500',
    desc: 'ECU 抽象层 - 硬件抽象与接口标准化',
    items: [
      { name: 'CanIf', status: '已完成', version: 'v1.2.0', stars: 52, forks: 14, docs: true, desc: 'CAN接口层，统一管理CAN通信' },
      { name: 'IoHwAb', status: '已完成', version: 'v1.1.0', stars: 36, forks: 8, docs: true, desc: 'IO硬件抽象层' },
      { name: 'CanTp', status: '已完成', version: 'v1.1.0', stars: 41, forks: 10, docs: true, desc: 'CAN传输协议层(ISO 15765-2)' },
      { name: 'EthIf', status: '已完成', version: 'v1.0.0', stars: 33, forks: 7, docs: true, desc: '以太网接口层' },
      { name: 'MemIf', status: '已完成', version: 'v1.1.0', stars: 29, forks: 6, docs: true, desc: '存储器接口层' },
      { name: 'Fee', status: '已完成', version: 'v1.1.0', stars: 31, forks: 7, docs: true, desc: 'Flash EEPROM仿真层' },
      { name: 'Ea', status: '已完成', version: 'v1.0.0', stars: 25, forks: 5, docs: true, desc: 'EEPROM抽象层' },
      { name: 'FrIf', status: '已完成', version: 'v1.0.0', stars: 22, forks: 4, docs: true, desc: 'FlexRay接口层' },
      { name: 'LinIf', status: '已完成', version: 'v1.0.0', stars: 24, forks: 5, docs: true, desc: 'LIN接口层' },
    ],
  },
  {
    category: 'Service',
    layer: 'Service',
    icon: Database,
    color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
    badgeColor: 'bg-teal-500/10 text-teal-500',
    desc: '服务层 - 通信、存储与诊断服务',
    items: [
      { name: 'Com', status: '开发中', version: 'v0.8.0', stars: 18, forks: 4, docs: true, desc: '通信服务层，信号路由与打包' },
      { name: 'PduR', status: '开发中', version: 'v0.7.0', stars: 15, forks: 3, docs: true, desc: 'PDU路由器，协议数据单元路由' },
      { name: 'NvM', status: '规划中', version: '-', stars: 12, forks: 2, docs: false, desc: '非易失性存储管理器' },
      { name: 'Dcm', status: '规划中', version: '-', stars: 10, forks: 2, docs: false, desc: '诊断通信管理器(UDS)' },
      { name: 'Dem', status: '规划中', version: '-', stars: 8, forks: 1, docs: false, desc: '诊断事件管理器' },
    ],
  },
  {
    category: 'RTE + ASW',
    layer: 'RTE + ASW',
    icon: Radio,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    badgeColor: 'bg-emerald-500/10 text-emerald-500',
    desc: '运行时环境 + 应用层组件',
    items: [
      { name: 'Rte', status: '头文件完成', version: 'v0.5.0', stars: 14, forks: 3, docs: true, desc: '运行时环境，组件间通信接口' },
      { name: 'EngineControl', status: '规划中', version: '-', stars: 6, forks: 1, docs: false, desc: '发动机控制应用组件' },
      { name: 'VehicleDynamics', status: '规划中', version: '-', stars: 5, forks: 1, docs: false, desc: '车辆动力学应用组件' },
      { name: 'DiagnosticManager', status: '规划中', version: '-', stars: 4, forks: 0, docs: false, desc: '诊断管理应用组件' },
      { name: 'IOControl', status: '规划中', version: '-', stars: 4, forks: 0, docs: false, desc: 'IO控制应用组件' },
    ],
  },
];

export function OpenSourcePage() {
  const [activeFilter, setActiveFilter] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const { stats, loading, error, refresh, findRepo } = useGitHubRepos();
  const { selectedModules, toggleModule, removeModule, clearAll, isSelected, canAddMore, maxItems } = useModuleCompare();

  // Merge static data with GitHub API data
  const modules = useMemo(() => {
    return staticModules.map((group) => ({
      ...group,
      items: group.items.map((item) => ({
        ...item,
        repo: findRepo(item.name),
      })),
    }));
  }, [findRepo]);

  const filteredModules = modules
    .filter((m) => activeFilter === '全部' || m.layer === activeFilter)
    .map((m) => ({
      ...m,
      items: m.items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.desc.includes(searchQuery)
      ),
    }))
    .filter((m) => m.items.length > 0);

  // Compute totals from merged data
  const totalStars = useMemo(() => {
    return modules.reduce(
      (sum, g) => sum + g.items.reduce((s, i) => s + (i.repo?.stargazers_count ?? i.stars), 0),
      0
    );
  }, [modules]);

  const totalForks = useMemo(() => {
    return modules.reduce(
      (sum, g) => sum + g.items.reduce((s, i) => s + (i.repo?.forks_count ?? i.forks), 0),
      0
    );
  }, [modules]);

  const matchedReposCount = useMemo(() => {
    return modules.reduce(
      (sum, g) => sum + g.items.filter((i) => i.repo !== undefined).length,
      0
    );
  }, [modules]);

  return (
    <div className="min-h-screen pt-16">
      <Helmet>
        <title>开源代码 - YuleTech | AutoSAR BSW 开源协议栈</title>
        <meta name="description" content="基于 AutoSAR Classic Platform 4.x 标准，为全球主流芯片公司的处理器构建完整的 BSW 栈。从底层驱动到应用组件，全部开源，永久免费。" />
      </Helmet>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-[hsl(var(--primary))]/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              开源项目
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              AutoSAR BSW
              <span className="text-gradient-accent"> 开源代码</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              基于 AutoSAR Classic Platform 4.x 标准，为全球主流芯片公司的处理器构建完整的 BSW 栈。
              从底层驱动到应用组件，全部开源，永久免费。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://github.com/frisky1985/yuleCommunity"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-6 py-3 bg-[hsl(var(--primary))] text-primary-foreground rounded-xl font-semibold hover:bg-[hsl(var(--primary-glow))] transition-all"
              >
                <Code2 className="w-4 h-4" />
                在 GitHub 上查看
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <button className="flex items-center gap-2 px-6 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-all border border-border">
                <BookOpen className="w-4 h-4" />
                贡献指南
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 border-y border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-[hsl(var(--accent))]">32</div>
              <div className="text-sm text-muted-foreground">开源模块</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[hsl(var(--accent))]">18</div>
              <div className="text-sm text-muted-foreground">已完成</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5">
                <div className="text-2xl font-bold text-[hsl(var(--accent))]">{totalStars}</div>
                {stats && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
                    实时
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">总 Stars</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5">
                <div className="text-2xl font-bold text-[hsl(var(--accent))]">{totalForks}</div>
                {stats && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
                    实时
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">总 Forks</div>
            </div>
          </div>

          {/* GitHub sync status */}
          <div className="mt-4 flex items-center justify-center gap-3">
            {loading && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <RefreshCw className="w-3 h-3 animate-spin" />
                正在同步 GitHub 数据...
              </span>
            )}
            {error && (
              <span className="flex items-center gap-1.5 text-xs text-amber-500">
                <AlertCircle className="w-3 h-3" />
                GitHub 数据同步失败，显示缓存数据
              </span>
            )}
            {stats && !loading && (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Code2 className="w-3 h-3" />
                  已同步 {matchedReposCount}/32 个模块
                </span>
                <button
                  onClick={refresh}
                  className="flex items-center gap-1 text-xs text-[hsl(var(--accent))] hover:underline"
                  title="刷新 GitHub 数据"
                >
                  <RefreshCw className="w-3 h-3" />
                  刷新
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="py-8 sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
              {layerFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeFilter === filter
                      ? 'bg-[hsl(var(--primary))] text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索模块..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Module Lists */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {filteredModules.map((mod) => (
            <div key={mod.category}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg ${mod.color} flex items-center justify-center border`}>
                  <mod.icon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{mod.category}</h2>
                  <p className="text-sm text-muted-foreground">{mod.desc}</p>
                </div>
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${mod.badgeColor}`}>
                  {mod.items.length} 模块
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mod.items.map((item) => {
                  const stars = item.repo?.stargazers_count ?? item.stars;
                  const forks = item.repo?.forks_count ?? item.forks;
                  const hasRepo = item.repo !== undefined;
                  const isItemSelected = isSelected(item.name.toLowerCase());

                  const handleCompareToggle = (e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleModule({
                      id: item.name.toLowerCase(),
                      name: item.name,
                      layer: mod.layer,
                      status: item.status,
                      version: item.version,
                      stars,
                      forks,
                      desc: item.desc,
                    });
                  };

                  return (
                    <div
                      key={item.name}
                      className={`group relative bg-card border rounded-xl p-5 hover:border-[hsl(var(--accent))]/30 transition-all hover:shadow-elegant ${
                        isItemSelected ? 'border-primary ring-1 ring-primary' : 'border-border'
                      }`}
                    >
                      {/* Compare Checkbox */}
                      <button
                        onClick={handleCompareToggle}
                        className={`absolute top-3 right-3 z-10 w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                          isItemSelected
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-border bg-card hover:border-primary/50'
                        } ${!canAddMore && !isItemSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!canAddMore && !isItemSelected}
                        title={isItemSelected ? '取消对比' : '添加到对比'}
                      >
                        {isItemSelected && <Scale className="w-3.5 h-3.5" />}
                      </button>

                      <Link
                        to={`/opensource/${item.name}`}
                        className="block"
                      >
                        <div className="flex items-start justify-between mb-3 pr-8">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-semibold text-lg">{item.name}</span>
                            {item.status === '已完成' ? (
                              <span className="flex items-center gap-1 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> 已完成
                              </span>
                            ) : item.status === '开发中' ? (
                              <span className="flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3" /> 开发中
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3" /> 规划中
                              </span>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{item.desc}</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4 text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5" /> {stars}
                            </span>
                            <span className="flex items-center gap-1">
                              <GitFork className="w-3.5 h-3.5" /> {forks}
                            </span>
                            {item.version !== '-' && (
                              <span className="font-mono text-xs">{item.version}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {hasRepo && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
                                GitHub
                              </span>
                            )}
                            {item.docs && (
                              <span
                                className="p-1.5 rounded-md text-muted-foreground"
                                onClick={(e) => e.preventDefault()}
                              >
                                <BookOpen className="w-4 h-4" />
                              </span>
                            )}
                            <span
                              className="p-1.5 rounded-md text-muted-foreground"
                              onClick={(e) => e.preventDefault()}
                            >
                              <Download className="w-4 h-4" />
                            </span>
                            {item.repo && (
                              <a
                                href={item.repo.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-md text-muted-foreground hover:text-[hsl(var(--accent))] transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Test Coverage Dashboard */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-3">测试验证与覆盖率</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              YuleTech BSW 模块的全面测试报告，包含单元测试、集成测试、HIL 测试和代码覆盖率分析。
              确保每个模块达到车载软件质量标准。
            </p>
          </div>
          <TestCoverageDashboard />
        </div>
      </section>

      {/* Dependency Graph */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-3">模块依赖关系图</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              可视化展示 YuleTech BSW 各模块间的依赖关系，从 MCAL 底层驱动到 ASW 应用软件的完整调用链。
              点击节点查看详细信息，使用左侧控制面板筛选不同层级。
            </p>
          </div>
          <DependencyGraph />
        </div>
      </section>

      {/* Contribution CTA */}
      <section className="py-20 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">成为开源贡献者</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            无论你是经验丰富的汽车软件工程师，还是刚入门的爱好者，
            YuleTech 社区都欢迎你的贡献。提交代码、报告问题、完善文档，
            与我们一起打造中国最优秀的 AutoSAR 开源生态。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-3 bg-white text-[hsl(var(--primary))] rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg">
              阅读贡献指南
            </button>
            <button className="px-8 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20">
              查看待办任务
            </button>
          </div>
        </div>
      </section>

      {/* Compare Bar */}
      <ModuleCompareBar
        modules={selectedModules}
        onRemove={removeModule}
        onClear={clearAll}
        maxItems={maxItems}
      />
    </div>
  );
}
