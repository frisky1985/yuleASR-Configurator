import { useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  RotateCcw,
  FileCode,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  Layers,
  Clock,
  Shield,
  Filter,
  Download,
  Eye,
  GitBranch,
  Terminal,
} from 'lucide-react';

// 测试类型定义
interface TestCase {
  id: string;
  name: string;
  category: 'unit' | 'integration' | 'hil' | 'performance';
  status: 'passed' | 'failed' | 'running' | 'pending' | 'skipped';
  duration: number;
  module: string;
  coverage?: number;
  error?: string;
}

// 覆盖率数据
interface CoverageData {
  module: string;
  lines: number;
  branches: number;
  functions: number;
  statements: number;
}

// 模拟测试数据
const mockTestCases: TestCase[] = [
  { id: 'TC001', name: 'Can_Init_ValidConfig', category: 'unit', status: 'passed', duration: 12, module: 'Can', coverage: 95 },
  { id: 'TC002', name: 'Can_Write_InvalidId', category: 'unit', status: 'passed', duration: 8, module: 'Can', coverage: 88 },
  { id: 'TC003', name: 'PduR_Routing_MultiFrame', category: 'integration', status: 'passed', duration: 45, module: 'PduR', coverage: 92 },
  { id: 'TC004', name: 'Com_SendSignal_Timeout', category: 'unit', status: 'failed', duration: 120, module: 'Com', coverage: 76, error: 'Timeout not triggered' },
  { id: 'TC005', name: 'Dem_ReportError_E2E', category: 'hil', status: 'running', duration: 0, module: 'Dem' },
  { id: 'TC006', name: 'Nvm_WriteBlock_CrcCheck', category: 'unit', status: 'passed', duration: 25, module: 'Nvm', coverage: 98 },
  { id: 'TC007', name: 'CanTp_FlowControl_Overflow', category: 'integration', status: 'passed', duration: 67, module: 'CanTp', coverage: 85 },
  { id: 'TC008', name: 'Dcm_DiagnosticSessionControl', category: 'hil', status: 'pending', duration: 0, module: 'Dcm' },
  { id: 'TC009', name: 'BswM_ModeSwitch_Perf', category: 'performance', status: 'passed', duration: 234, module: 'BswM' },
  { id: 'TC010', name: 'Ea_Init_InvalidBlock', category: 'unit', status: 'skipped', duration: 0, module: 'Ea' },
  { id: 'TC011', name: 'Fee_GarbageCollection', category: 'integration', status: 'passed', duration: 890, module: 'Fee', coverage: 91 },
  { id: 'TC012', name: 'CanIf_PduModeControl', category: 'unit', status: 'passed', duration: 15, module: 'CanIf', coverage: 94 },
  { id: 'TC013', name: 'EcuM_ShutdownSequence', category: 'hil', status: 'failed', duration: 560, module: 'EcuM', error: 'Watchdog not triggered' },
  { id: 'TC014', name: 'WdgM_AliveSupervision', category: 'unit', status: 'passed', duration: 32, module: 'WdgM', coverage: 97 },
  { id: 'TC015', name: 'Xcp_DaqList_Config', category: 'integration', status: 'running', duration: 0, module: 'Xcp' },
];

// 覆盖率数据
const mockCoverageData: CoverageData[] = [
  { module: 'Can', lines: 94.5, branches: 87.2, functions: 100, statements: 93.8 },
  { module: 'CanIf', lines: 96.2, branches: 91.5, functions: 100, statements: 95.1 },
  { module: 'CanTp', lines: 88.7, branches: 82.3, functions: 95, statements: 87.9 },
  { module: 'PduR', lines: 91.3, branches: 85.6, functions: 100, statements: 90.2 },
  { module: 'Com', lines: 76.4, branches: 71.2, functions: 88, statements: 75.8 },
  { module: 'Nvm', lines: 98.1, branches: 94.7, functions: 100, statements: 97.5 },
  { module: 'Dem', lines: 85.2, branches: 78.9, functions: 92, statements: 84.6 },
  { module: 'Dcm', lines: 82.5, branches: 76.3, functions: 90, statements: 81.9 },
  { module: 'BswM', lines: 89.6, branches: 83.4, functions: 95, statements: 88.7 },
  { module: 'Ea', lines: 92.1, branches: 86.8, functions: 100, statements: 91.4 },
  { module: 'Fee', lines: 90.8, branches: 84.2, functions: 95, statements: 89.5 },
  { module: 'EcuM', lines: 78.3, branches: 72.1, functions: 85, statements: 77.6 },
  { module: 'WdgM', lines: 97.5, branches: 93.2, functions: 100, statements: 96.8 },
  { module: 'Xcp', lines: 86.4, branches: 79.8, functions: 92, statements: 85.7 },
];

const categoryLabels: Record<string, { label: string; color: string; bg: string }> = {
  unit: { label: '单元测试', color: 'text-blue-600', bg: 'bg-blue-100' },
  integration: { label: '集成测试', color: 'text-purple-600', bg: 'bg-purple-100' },
  hil: { label: 'HIL测试', color: 'text-orange-600', bg: 'bg-orange-100' },
  performance: { label: '性能测试', color: 'text-green-600', bg: 'bg-green-100' },
};

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  passed: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', label: '通过' },
  failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: '失败' },
  running: { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100', label: '运行中' },
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: '待执行' },
  skipped: { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100', label: '跳过' },
};

export function TestCoverageDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'coverage'>('overview');

  // 统计数据
  const stats = useMemo(() => {
    const total = mockTestCases.length;
    const passed = mockTestCases.filter(t => t.status === 'passed').length;
    const failed = mockTestCases.filter(t => t.status === 'failed').length;
    const running = mockTestCases.filter(t => t.status === 'running').length;
    const pending = mockTestCases.filter(t => t.status === 'pending').length;
    const skipped = mockTestCases.filter(t => t.status === 'skipped').length;
    const avgCoverage = mockCoverageData.reduce((sum, c) => sum + c.lines, 0) / mockCoverageData.length;
    
    return { total, passed, failed, running, pending, skipped, avgCoverage };
  }, []);

  // 过滤测试用例
  const filteredTests = useMemo(() => {
    return mockTestCases.filter(test => {
      const categoryMatch = selectedCategory === 'all' || test.category === selectedCategory;
      const moduleMatch = selectedModule === 'all' || test.module === selectedModule;
      return categoryMatch && moduleMatch;
    });
  }, [selectedCategory, selectedModule]);

  // 模块列表
  const modules = useMemo(() => [...new Set(mockTestCases.map(t => t.module))].sort(), []);

  const getProgressColor = (value: number) => {
    if (value >= 90) return 'bg-green-500';
    if (value >= 80) return 'bg-yellow-500';
    if (value >= 70) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6 border-b border-border bg-muted/30">
        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <FileCode className="w-4 h-4" />
            总用例数
          </div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        
        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
            <CheckCircle2 className="w-4 h-4" />
            通过
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
          <div className="text-xs text-muted-foreground">{((stats.passed / stats.total) * 100).toFixed(1)}%</div>
        </div>
        
        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="flex items-center gap-2 text-red-600 text-sm mb-1">
            <XCircle className="w-4 h-4" />
            失败
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          <div className="text-xs text-muted-foreground">{((stats.failed / stats.total) * 100).toFixed(1)}%</div>
        </div>
        
        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="flex items-center gap-2 text-blue-600 text-sm mb-1">
            <Activity className="w-4 h-4" />
            运行中
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
        </div>
        
        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="flex items-center gap-2 text-yellow-600 text-sm mb-1">
            <Clock className="w-4 h-4" />
            待执行
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        
        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="flex items-center gap-2 text-purple-600 text-sm mb-1">
            <Shield className="w-4 h-4" />
            平均覆盖率
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.avgCoverage.toFixed(1)}%</div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="flex border-b border-border">
        {[
          { id: 'overview', label: '概览', icon: BarChart3 },
          { id: 'tests', label: '测试用例', icon: Terminal },
          { id: 'coverage', label: '覆盖率', icon: PieChart },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              const tabId = tab.id as 'overview' | 'tests' | 'coverage';
              setActiveTab(tabId);
            }}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="p-6">
        {/* 概览标签 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 测试趋势图 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  测试执行趋势
                </h3>
                <div className="h-48 flex items-end justify-between gap-2">
                  {[65, 72, 68, 85, 78, 92, 88, 95, 91, 96, 89, 94].map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-primary/20 rounded-t"
                        style={{ height: `${value * 1.5}px` }}
                      >
                        <div
                          className="w-full bg-primary rounded-t transition-all"
                          style={{ height: `${value}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{i + 1}月</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  按类别分布
                </h3>
                <div className="space-y-3">
                  {Object.entries(categoryLabels).map(([key, config]) => {
                    const count = mockTestCases.filter(t => t.category === key).length;
                    const percentage = (count / mockTestCases.length) * 100;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 最近失败的测试 */}
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-700">
                <XCircle className="w-4 h-4" />
                最近失败的测试
              </h3>
              <div className="space-y-2">
                {mockTestCases
                  .filter(t => t.status === 'failed')
                  .map(test => (
                    <div key={test.id} className="flex items-center gap-3 bg-card rounded p-3 border border-border">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <div className="flex-1">
                        <div className="font-medium">{test.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {test.module} • {test.error}
                        </div>
                      </div>
                      <span className="text-sm text-red-600 font-medium">{test.duration}ms</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* 测试用例标签 */}
        {activeTab === 'tests' && (
          <div className="space-y-4">
            {/* 筛选器 */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 rounded border border-border bg-white text-sm"
              >
                <option value="all">所有类别</option>
                {Object.entries(categoryLabels).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="px-3 py-1.5 rounded border border-border bg-white text-sm"
              >
                <option value="all">所有模块</option>
                {modules.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded text-sm hover:bg-primary/90">
                <Play className="w-4 h-4" />
                运行全部
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 border border-border rounded text-sm hover:bg-muted">
                <RotateCcw className="w-4 h-4" />
                重试失败
              </button>
            </div>

            {/* 测试列表 */}
            <div className="space-y-2">
              {filteredTests.map(test => {
                const config = statusConfig[test.status];
                const StatusIcon = config.icon;
                const categoryConfig = categoryLabels[test.category];
                
                return (
                  <div
                    key={test.id}
                    className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    <StatusIcon className={`w-5 h-5 ${config.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{test.name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${categoryConfig.bg} ${categoryConfig.color}`}>
                          {categoryConfig.label}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {test.id} • {test.module}
                        {test.error && <span className="text-red-600 ml-2">• {test.error}</span>}
                      </div>
                    </div>
                    {test.coverage && (
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium">{test.coverage}%</span>
                      </div>
                    )}
                    <span className="text-sm text-muted-foreground w-20 text-right">
                      {test.duration > 0 ? `${test.duration}ms` : '-'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded hover:bg-muted" title="查看详情">
                        <Eye className="w-4 h-4" />
                      </button>
                      {test.status === 'failed' && (
                        <button className="p-1.5 rounded hover:bg-muted" title="重新运行">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 覆盖率标签 */}
        {activeTab === 'coverage' && (
          <div className="space-y-4">
            {/* 覆盖率摘要 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: '行覆盖率', value: stats.avgCoverage, icon: FileCode },
                { label: '分支覆盖率', value: 84.3, icon: GitBranch },
                { label: '函数覆盖率', value: 95.7, icon: Layers },
                { label: '语句覆盖率', value: 88.9, icon: Terminal },
              ].map((item, i) => (
                <div key={i} className="bg-muted/30 rounded-lg p-4 text-center">
                  <item.icon className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-2xl font-bold">{item.value.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>

            {/* 模块覆盖率列表 */}
            <div className="bg-muted/20 rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 bg-muted font-medium text-sm">
                <div className="col-span-2">模块</div>
                <div className="col-span-2">行覆盖</div>
                <div className="col-span-2">分支覆盖</div>
                <div className="col-span-2">函数覆盖</div>
                <div className="col-span-2">语句覆盖</div>
                <div className="col-span-2"></div>
              </div>
              <div className="divide-y divide-border">
                {mockCoverageData.map((data) => (
                  <div key={data.module} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30">
                    <div className="col-span-2 font-medium">{data.module}</div>
                    {[
                      { value: data.lines, key: 'lines' },
                      { value: data.branches, key: 'branches' },
                      { value: data.functions, key: 'functions' },
                      { value: data.statements, key: 'statements' },
                    ].map(({ value, key }) => (
                      <div key={key} className="col-span-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getProgressColor(value)}`}
                              style={{ width: `${value}%` }}
                            />
                          </div>
                          <span className="text-sm w-12">{value.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                    <div className="col-span-2 flex justify-end gap-2">
                      <button className="p-1.5 rounded hover:bg-muted" title="查看报告">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-muted" title="下载">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 低覆盖率警告 */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                覆盖率警告
              </h4>
              <p className="text-sm text-yellow-700">
                以下模块覆盖率低于 80%，建议增加测试用例：
                <span className="font-medium">Com (76.4%), EcuM (78.3%), Dcm (82.5%)</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
