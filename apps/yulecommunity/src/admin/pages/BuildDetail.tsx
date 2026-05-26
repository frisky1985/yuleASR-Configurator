import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Pause,
  RotateCcw,
  Trash2,
  Download,
  Clock,
  User,
  Tag,
  GitBranch,
  FileCode,
  CheckCircle,
  XCircle,
  Loader2,
  Terminal,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface BuildDetail {
  id: string;
  name: string;
  platform: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  userId: string;
  userName: string;
  branch: string;
  commit: string;
  compiler: string;
  optimization: string;
  artifacts: BuildArtifact[];
}

interface BuildArtifact {
  id: string;
  name: string;
  size: string;
  type: string;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  step?: string;
}

const mockBuild: BuildDetail = {
  id: '1',
  name: 'STM32-GCC-Build',
  platform: 'STM32F4',
  status: 'success',
  createdAt: '2025-01-28T15:30:00Z',
  startedAt: '2025-01-28T15:30:05Z',
  completedAt: '2025-01-28T15:31:12Z',
  userId: 'user1',
  userName: 'zhangsan',
  branch: 'main',
  commit: 'a1b2c3d',
  compiler: 'arm-none-eabi-gcc 12.2.1',
  optimization: '-O2',
  artifacts: [
    { id: '1', name: 'firmware.elf', size: '128 KB', type: 'executable' },
    { id: '2', name: 'firmware.bin', size: '64 KB', type: 'binary' },
    { id: '3', name: 'firmware.hex', size: '96 KB', type: 'hex' },
    { id: '4', name: 'firmware.map', size: '32 KB', type: 'map' },
  ],
};

const mockLogs: LogEntry[] = [
  { timestamp: '2025-01-28 15:30:05', level: 'info', message: 'Build started', step: 'init' },
  { timestamp: '2025-01-28 15:30:06', level: 'info', message: 'Cloning repository...', step: 'checkout' },
  { timestamp: '2025-01-28 15:30:08', level: 'info', message: 'Repository cloned successfully', step: 'checkout' },
  { timestamp: '2025-01-28 15:30:09', level: 'info', message: 'Checking out branch: main', step: 'checkout' },
  { timestamp: '2025-01-28 15:30:10', level: 'info', message: 'Commit: a1b2c3d - Update CAN driver configuration', step: 'checkout' },
  { timestamp: '2025-01-28 15:30:11', level: 'info', message: 'Installing dependencies...', step: 'deps' },
  { timestamp: '2025-01-28 15:30:15', level: 'info', message: 'Dependencies installed', step: 'deps' },
  { timestamp: '2025-01-28 15:30:16', level: 'info', message: 'Running build script...', step: 'build' },
  { timestamp: '2025-01-28 15:30:20', level: 'info', message: 'Compiling main.c...', step: 'build' },
  { timestamp: '2025-01-28 15:30:25', level: 'info', message: 'Compiling can_driver.c...', step: 'build' },
  { timestamp: '2025-01-28 15:30:30', level: 'info', message: 'Compiling uart_driver.c...', step: 'build' },
  { timestamp: '2025-01-28 15:30:35', level: 'warning', message: 'uart_driver.c:45: warning: unused variable', step: 'build' },
  { timestamp: '2025-01-28 15:30:40', level: 'info', message: 'Compiling gpio_driver.c...', step: 'build' },
  { timestamp: '2025-01-28 15:30:50', level: 'info', message: 'Linking...', step: 'link' },
  { timestamp: '2025-01-28 15:31:00', level: 'info', message: 'Generating binary output...', step: 'post' },
  { timestamp: '2025-01-28 15:31:05', level: 'info', message: 'Generating hex file...', step: 'post' },
  { timestamp: '2025-01-28 15:31:10', level: 'info', message: 'Build completed successfully', step: 'post' },
  { timestamp: '2025-01-28 15:31:12', level: 'info', message: 'Artifacts uploaded', step: 'upload' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: '等待中', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400', icon: Clock },
  running: { label: '构建中', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400', icon: Loader2 },
  success: { label: '成功', color: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircle },
  failed: { label: '失败', color: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400', icon: XCircle },
  cancelled: { label: '已取消', color: 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400', icon: XCircle },
};

const LOG_COLORS: Record<string, string> = {
  info: 'text-slate-300',
  warning: 'text-yellow-400',
  error: 'text-red-400',
  debug: 'text-slate-500',
};

export const BuildDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [build, setBuild] = useState<BuildDetail>(mockBuild);
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
  const [isLoading, setIsLoading] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set(['init', 'checkout', 'deps', 'build', 'link', 'post', 'upload']));
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error'>('all');
  const logEndRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setBuild(mockBuild);
      setLogs(mockLogs);
      setIsLoading(false);
    }, 500);
  }, [id]);

  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const formatDuration = () => {
    if (!build.startedAt) return '-';
    const end = build.completedAt ? new Date(build.completedAt) : new Date();
    const start = new Date(build.startedAt);
    const diff = end.getTime() - start.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}分${seconds % 60}秒`;
  };

  const handleRestart = async () => {
    if (!window.confirm('确定要重新构建吗？')) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setBuild({ ...build, status: 'running', startedAt: new Date().toISOString(), completedAt: undefined });
    setIsLoading(false);
  };

  const handleCancel = async () => {
    if (!window.confirm('确定要取消构建吗？')) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setBuild({ ...build, status: 'cancelled', completedAt: new Date().toISOString() });
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('确定要删除该构建记录吗？')) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    navigate('/admin/builds');
  };

  const toggleStep = (step: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(step)) {
      newExpanded.delete(step);
    } else {
      newExpanded.add(step);
    }
    setExpandedSteps(newExpanded);
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.level === filter || log.level === 'error';
  });

  const groupedLogs = filteredLogs.reduce((acc, log) => {
    const step = log.step || 'other';
    if (!acc[step]) acc[step] = [];
    acc[step].push(log);
    return acc;
  }, {} as Record<string, LogEntry[]>);

  const StatusIcon = STATUS_CONFIG[build.status]?.icon || Clock;
  const statusConfig = STATUS_CONFIG[build.status];

  if (isLoading && !build) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/builds')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft className="h-5 w-5" />
            返回
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{build.name}</h1>
            <div className="flex items-center gap-4 mt-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                <StatusIcon className={`h-3.5 w-3.5 ${build.status === 'running' ? 'animate-spin' : ''}`} />
                {statusConfig.label}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">ID: {build.id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {build.status === 'running' ? (
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
            >
              <Pause className="h-4 w-4" />
              取消
            </button>
          ) : (
            <button
              onClick={handleRestart}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <RotateCcw className="h-4 w-4" />
              重新构建
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
            删除
          </button>
        </div>
      </div>

      {/* Build Info Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">构建时长</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{formatDuration()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">创建者</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{build.userName}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <GitBranch className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">分支</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{build.branch}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Tag className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Commit</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white font-mono">{build.commit}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Build Details */}
      <div className="grid grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">配置信息</h3>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 dark:text-slate-400">目标平台</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{build.platform}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 dark:text-slate-400">编译器</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{build.compiler}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 dark:text-slate-400">优化级别</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{build.optimization}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 dark:text-slate-400">创建时间</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {new Date(build.createdAt).toLocaleString('zh-CN')}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">完成时间</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {build.completedAt ? new Date(build.completedAt).toLocaleString('zh-CN') : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Artifacts */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">构建产物</h3>
          <div className="space-y-2">
            {build.artifacts.map((artifact) => (
              <div
                key={artifact.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileCode className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{artifact.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{artifact.size}</p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
            {build.artifacts.length === 0 && (
              <p className="text-center text-slate-500 dark:text-slate-400 py-4">暂无构建产物</p>
            )}
          </div>
        </div>
      </div>

      {/* Build Logs */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Terminal className="h-5 w-5 text-slate-400" />
            <h3 className="font-medium text-slate-200">构建日志</h3>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-slate-800 text-slate-300 text-sm rounded px-2 py-1 border border-slate-700"
            >
              <option value="all">全部</option>
              <option value="info">信息</option>
              <option value="warning">警告</option>
              <option value="error">错误</option>
            </select>
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-3 py-1 text-sm rounded ${
                autoScroll
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              自动滚动
            </button>
            <button
              onClick={() => {
                const blob = new Blob([logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n')], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `build-${build.id}.log`;
                a.click();
              }}
              className="flex items-center gap-1.5 px-3 py-1 text-sm bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
            >
              <Download className="h-3.5 w-3.5" />
              下载日志
            </button>
          </div>
        </div>
        <div
          ref={logContainerRef}
          className="h-96 overflow-y-auto p-4 font-mono text-sm"
          onScroll={() => {
            if (logContainerRef.current) {
              const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
              setAutoScroll(scrollHeight - scrollTop - clientHeight < 50);
            }
          }}
        >
          {Object.entries(groupedLogs).map(([step, stepLogs]) => (
            <div key={step} className="mb-4">
              <button
                onClick={() => toggleStep(step)}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-300 mb-2"
              >
                {expandedSteps.has(step) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span className="text-xs uppercase tracking-wider">{step}</span>
                <span className="text-xs text-slate-600">({stepLogs.length} 行)</span>
              </button>
              {expandedSteps.has(step) && (
                <div className="space-y-1 pl-6">
                  {stepLogs.map((log, index) => (
                    <div key={index} className="flex gap-3">
                      <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                      <span className={`uppercase shrink-0 w-12 ${LOG_COLORS[log.level]}`}>
                        {log.level}
                      </span>
                      <span className={LOG_COLORS[log.level]}>{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
};
