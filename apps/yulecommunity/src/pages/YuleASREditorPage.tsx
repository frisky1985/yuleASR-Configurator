import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Play, 
  Download, 
  GitBranch,
  CheckCircle,
  AlertCircle,
  Search,
  Settings,
  ChevronRight,
  MoreVertical,
  Code,
  Terminal,
  Cpu,
  Wrench
} from 'lucide-react';
import { AnimatedPage } from '../components/AnimatedPage';

// 模拟数据类型
interface ConfigParameter {
  name: string;
  type: 'string' | 'integer' | 'float' | 'boolean' | 'enum';
  value: unknown;
  description: string;
  min?: number;
  max?: number;
  options?: string[];
}

interface ConfigModule {
  id: string;
  name: string;
  layer: string;
  version: string;
  enabled: boolean;
  parameters: ConfigParameter[];
}

interface Config {
  id: string;
  name: string;
  description: string;
  platform: string;
  version: string;
  modules: ConfigModule[];
  updatedAt: string;
}

interface ValidationResult {
  valid: boolean;
  errors: Array<{ path: string; message: string; severity: 'error' | 'warning' | 'info' }>;
  warnings: Array<{ path: string; message: string; severity: 'error' | 'warning' | 'info' }>;
}

export function YuleASREditorPage() {
  const { configId, moduleId } = useParams<{ configId: string; moduleId?: string }>();
  const navigate = useNavigate();
  
  const [config, setConfig] = useState<Config | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDisabled, setShowDisabled] = useState(true);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [activeTab, setActiveTab] = useState<'params' | 'code' | 'build'>('params');

  // 加载配置
  useEffect(() => {
    loadConfig();
  }, [configId]);

  useEffect(() => {
    if (moduleId) {
      setSelectedModuleId(moduleId);
    }
  }, [moduleId]);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const mockConfig: Config = {
        id: configId || '1',
        name: 'STM32H743 项目配置',
        description: '用于STM32H743芯片的完整ASR配置',
        platform: 'stm32',
        version: '1.2.0',
        updatedAt: '2024-05-10T14:30:00Z',
        modules: [
          {
            id: 'mod1',
            name: 'Core System',
            layer: 'HAL',
            version: '2.1.0',
            enabled: true,
            parameters: [
              { name: 'clock_freq', type: 'integer', value: 480000000, description: '系统时钟频率', min: 1000000, max: 600000000 },
              { name: 'debug_mode', type: 'boolean', value: true, description: '启用调试模式' },
              { name: 'log_level', type: 'enum', value: 'info', options: ['debug', 'info', 'warn', 'error'], description: '日志级别' }
            ]
          },
          {
            id: 'mod2',
            name: 'Audio Pipeline',
            layer: 'Driver',
            version: '1.5.0',
            enabled: true,
            parameters: [
              { name: 'sample_rate', type: 'integer', value: 16000, description: '采样率', min: 8000, max: 48000 },
              { name: 'buffer_size', type: 'integer', value: 512, description: '缓冲区大小', min: 128, max: 4096 },
              { name: 'channels', type: 'integer', value: 2, description: '通道数', min: 1, max: 8 }
            ]
          },
          {
            id: 'mod3',
            name: 'VAD',
            layer: 'Algorithm',
            version: '3.0.0',
            enabled: true,
            parameters: [
              { name: 'sensitivity', type: 'float', value: 0.5, description: '灵敏度', min: 0, max: 1 },
              { name: 'hangover', type: 'integer', value: 300, description: '延迟时间(ms)', min: 0, max: 1000 },
              { name: 'mode', type: 'enum', value: 'aggressive', options: ['normal', 'aggressive', 'low_bitrate'], description: 'VAD模式' }
            ]
          },
          {
            id: 'mod4',
            name: 'ASR Engine',
            layer: 'Application',
            version: '2.2.0',
            enabled: false,
            parameters: [
              { name: 'model_path', type: 'string', value: '/models/asr.bin', description: '模型路径' },
              { name: 'beam_width', type: 'integer', value: 10, description: '波束宽度', min: 1, max: 50 },
              { name: 'lm_weight', type: 'float', value: 0.8, description: '语言模型权重', min: 0, max: 2 }
            ]
          },
          {
            id: 'mod5',
            name: 'Wake Word',
            layer: 'Application',
            version: '1.8.0',
            enabled: true,
            parameters: [
              { name: 'sensitivity', type: 'float', value: 0.7, description: '唤醒词灵敏度', min: 0, max: 1 },
              { name: 'keywords', type: 'string', value: '小小语音', description: '唤醒词' }
            ]
          }
        ]
      };
      
      setConfig(mockConfig);
      if (!selectedModuleId && mockConfig.modules.length > 0) {
        setSelectedModuleId(mockConfig.modules[0].id);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedModule = config?.modules.find(m => m.id === selectedModuleId);

  const handleParameterChange = (moduleId: string, paramName: string, value: unknown) => {
    if (!config) return;
    
    setConfig(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        modules: prev.modules.map(m => {
          if (m.id !== moduleId) return m;
          return {
            ...m,
            parameters: m.parameters.map(p => {
              if (p.name !== paramName) return p;
              return { ...p, value };
            })
          };
        })
      };
    });
    setIsDirty(true);
  };

  const handleToggleModule = (moduleId: string, enabled: boolean) => {
    if (!config) return;
    
    setConfig(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        modules: prev.modules.map(m => {
          if (m.id !== moduleId) return m;
          return { ...m, enabled };
        })
      };
    });
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsDirty(false);
      // 显示保存成功提示
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleValidate = useCallback(async () => {
    setIsValidating(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const errors: Array<{ path: string; message: string; severity: 'error' | 'warning' | 'info' }> = [];
    const warnings: Array<{ path: string; message: string; severity: 'error' | 'warning' | 'info' }> = [];
    
    config?.modules.forEach(module => {
      if (!module.enabled) return;
      
      module.parameters.forEach(param => {
        if (param.type === 'integer' || param.type === 'float') {
          const val = param.value as number;
          if (param.min !== undefined && val < param.min) {
            errors.push({ path: `${module.name}.${param.name}`, message: `${param.name} 值 ${val} 低于最小值 ${param.min}`, severity: 'error' });
          }
          if (param.max !== undefined && val > param.max) {
            errors.push({ path: `${module.name}.${param.name}`, message: `${param.name} 值 ${val} 超过最大值 ${param.max}`, severity: 'error' });
          }
        }
      });
    });
    
    const enabledCount = config?.modules.filter(m => m.enabled).length || 0;
    if (enabledCount < 3) {
      warnings.push({ path: 'config.modules', message: `仅启用了 ${enabledCount} 个模块，建议启用更多模块以获得完整功能`, severity: 'warning' });
    }
    
    setValidationResult({ valid: errors.length === 0, errors, warnings });
    setIsValidating(false);
  }, [config]);

  const generateCode = () => {
    if (!config) return '';
    
    let code = `/* yuleASR Configuration\n`;
    code += ` * Name: ${config.name}\n`;
    code += ` * Platform: ${config.platform}\n`;
    code += ` * Version: ${config.version}\n`;
    code += ` * Generated: ${new Date().toISOString()}\n`;
    code += ` */\n\n`;
    code += `#ifndef YULEASR_CONFIG_H\n`;
    code += `#define YULEASR_CONFIG_H\n\n`;
    
    config.modules.forEach(module => {
      if (!module.enabled) {
        code += `/* Module: ${module.name} - DISABLED */\n`;
        return;
      }
      code += `/* Module: ${module.name} (${module.layer}) */\n`;
      module.parameters.forEach(param => {
        const defineName = `YULEASR_${module.name.toUpperCase().replace(/\s+/g, '_')}_${param.name.toUpperCase()}`;
        if (param.type === 'string') {
          code += `#define ${defineName} "${param.value}"\n`;
        } else {
          code += `#define ${defineName} ${param.value}\n`;
        }
      });
      code += `\n`;
    });
    
    code += `#endif /* YULEASR_CONFIG_H */\n`;
    return code;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground mt-4">加载配置中...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">配置不存在</h3>
          <Link to="/yuleasr" className="text-primary hover:underline mt-2 inline-block">
            返回配置列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-background pt-16">
        {/* Header */}
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  to="/yuleasr"
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-foreground">{config.name}</h1>
                    {isDirty ? (
                      <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        未保存
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        已保存
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    最后修改: {new Date(config.updatedAt).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleValidate}
                  disabled={isValidating}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-accent rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50"
                >
                  {isValidating ? (
                    <div className="animate-spin w-4 h-4 border-2 border-foreground border-t-transparent rounded-full" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  验证
                </button>
                <button
                  onClick={handleSave}
                  disabled={!isDirty}
                  className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    !isDirty
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
                <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-accent rounded-lg hover:bg-accent/80 transition-colors">
                  <GitBranch className="w-4 h-4" />
                  同步
                </button>
                <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-4">
              {[
                { id: 'params', label: '参数配置', icon: Settings },
                { id: 'code', label: '代码预览', icon: Code },
                { id: 'build', label: '构建配置', icon: Terminal }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'params' && (
            <div className="grid grid-cols-12 gap-6">
              {/* Left Sidebar - Module Tree */}
              <div className="col-span-3">
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="p-3 border-b border-border bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">模块列表</span>
                    </div>
                  </div>
                  <div className="p-2 space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {config.modules.map(module => (
                      <button
                        key={module.id}
                        onClick={() => {
                          setSelectedModuleId(module.id);
                          navigate(`/yuleasr/editor/${configId}/${module.id}`, { replace: true });
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedModuleId === module.id
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground hover:bg-accent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={module.enabled}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleModule(module.id, e.target.checked);
                          }}
                          className="w-4 h-4 rounded border-border"
                        />
                        <span className={`flex-1 text-left ${!module.enabled && 'opacity-50'}`}>
                          {module.name}
                        </span>
                        <span className="text-xs text-muted-foreground">{module.layer}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center - Parameter Editor */}
              <div className="col-span-6">
                {selectedModule ? (
                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-muted/50 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{selectedModule.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {selectedModule.layer} · v{selectedModule.version}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        selectedModule.enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {selectedModule.enabled ? '已启用' : '已禁用'}
                      </span>
                    </div>

                    {!selectedModule.enabled ? (
                      <div className="p-8 text-center">
                        <p className="text-muted-foreground">此模块已禁用。请在左侧列表中启用它以配置参数。</p>
                      </div>
                    ) : (
                      <div className="p-4 space-y-6">
                        {selectedModule.parameters.map(param => (
                          <div key={param.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-foreground">
                                {param.name}
                              </label>
                              <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
                                {param.type}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{param.description}</p>
                            
                            {param.type === 'string' && (
                              <input
                                type="text"
                                value={param.value as string}
                                onChange={(e) => handleParameterChange(selectedModule.id, param.name, e.target.value)}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                              />
                            )}
                            
                            {param.type === 'integer' && (
                              <input
                                type="number"
                                value={param.value as number}
                                min={param.min}
                                max={param.max}
                                onChange={(e) => handleParameterChange(selectedModule.id, param.name, parseInt(e.target.value))}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                              />
                            )}
                            
                            {param.type === 'float' && (
                              <input
                                type="number"
                                step="0.01"
                                value={param.value as number}
                                min={param.min}
                                max={param.max}
                                onChange={(e) => handleParameterChange(selectedModule.id, param.name, parseFloat(e.target.value))}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                              />
                            )}
                            
                            {param.type === 'boolean' && (
                              <input
                                type="checkbox"
                                checked={param.value as boolean}
                                onChange={(e) => handleParameterChange(selectedModule.id, param.name, e.target.checked)}
                                className="w-5 h-5 rounded border-border"
                              />
                            )}
                            
                            {param.type === 'enum' && param.options && (
                              <select
                                value={param.value as string}
                                onChange={(e) => handleParameterChange(selectedModule.id, param.name, e.target.value)}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                              >
                                {param.options.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            )}
                            
                            {(param.min !== undefined || param.max !== undefined) && (
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>min: {param.min}</span>
                                <span>max: {param.max}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-card rounded-xl border border-border p-8 text-center">
                    <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">从左侧选择一个模块进行配置</p>
                  </div>
                )}
              </div>

              {/* Right Sidebar - Validation */}
              <div className="col-span-3 space-y-4">
                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    验证结果
                  </h4>
                  
                  {validationResult ? (
                    <div className="space-y-3">
                      {validationResult.errors.length === 0 && validationResult.warnings.length === 0 ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">配置有效</span>
                        </div>
                      ) : (
                        <>
                          {validationResult.errors.map((error, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium text-destructive">{error.path}</p>
                                <p className="text-muted-foreground">{error.message}</p>
                              </div>
                            </div>
                          ))}
                          {validationResult.warnings.map((warning, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium text-yellow-600">{warning.path}</p>
                                <p className="text-muted-foreground">{warning.message}</p>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">点击"验证"按钮检查配置</p>
                  )}
                </div>

                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-semibold text-foreground mb-3">配置统计</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">总模块数</dt>
                      <dd className="font-medium">{config.modules.length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">已启用</dt>
                      <dd className="font-medium text-green-600">
                        {config.modules.filter(m => m.enabled).length}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">已禁用</dt>
                      <dd className="font-medium text-muted-foreground">
                        {config.modules.filter(m => !m.enabled).length}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">总参数</dt>
                      <dd className="font-medium">
                        {config.modules.reduce((acc, m) => acc + m.parameters.length, 0)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/50 flex items-center justify-between">
                <span className="font-medium text-sm">生成的配置代码</span>
                <button className="text-sm text-primary hover:underline">复制到剪贴板</button>
              </div>
              <pre className="p-4 text-sm font-mono bg-muted/30 overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto">
                <code>{generateCode()}</code>
              </pre>
            </div>
          )}

          {activeTab === 'build' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">构建选项</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">编译器</label>
                      <select className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>GCC ARM 12.2</option>
                        <option>Clang 16</option>
                        <option>IAR ARM 9.40</option>
                        <option>Keil MDK 6</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">优化级别</label>
                      <select className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>Debug (调试)</option>
                        <option>Release (发布)</option>
                        <option>Size (最小代码)</option>
                        <option>Speed (最高速度)</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="enableLTO" className="w-4 h-4 rounded border-border" />
                      <label htmlFor="enableLTO" className="text-sm text-foreground">启用链接时优化 (LTO)</label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="stripSymbols" className="w-4 h-4 rounded border-border" />
                      <label htmlFor="stripSymbols" className="text-sm text-foreground">剥离调试符号</label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    <Wrench className="w-4 h-4" />
                    开始构建
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
