import { useState } from 'react';
import { 
  Settings, 
  Layers, 
  Cpu, 
  Network, 
  Database, 
  Download, 
  RotateCcw,
  Check,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2
} from 'lucide-react';

// BSW 模块定义
interface BSWModule {
  id: string;
  name: string;
  category: 'MCAL' | 'ECUAL' | 'Service' | 'RTE';
  description: string;
  icon: React.ReactNode;
  configurable: boolean;
  dependencies: string[];
  defaultConfig: Record<string, any>;
}

// 配置参数定义
interface ConfigParam {
  name: string;
  type: 'boolean' | 'number' | 'select' | 'text';
  label: string;
  description: string;
  defaultValue: string | number | boolean;
  options?: string[];
  min?: number;
  max?: number;
}

// 预定义模块
const BSW_MODULES: BSWModule[] = [
  // MCAL 层
  { id: 'mcu', name: 'Mcu', category: 'MCAL', description: '微控制器驱动', icon: <Cpu className="w-4 h-4" />, configurable: true, dependencies: [], defaultConfig: { ClockSource: 'PLL', SysTick: true } },
  { id: 'port', name: 'Port', category: 'MCAL', description: 'GPIO 端口驱动', icon: <Network className="w-4 h-4" />, configurable: true, dependencies: ['mcu'], defaultConfig: { PinCount: 32 } },
  { id: 'dio', name: 'Dio', category: 'MCAL', description: '数字 IO 驱动', icon: <Settings className="w-4 h-4" />, configurable: true, dependencies: ['port'], defaultConfig: {} },
  { id: 'can', name: 'Can', category: 'MCAL', description: 'CAN 控制器驱动', icon: <Network className="w-4 h-4" />, configurable: true, dependencies: ['mcu'], defaultConfig: { Baudrate: 500000, ControllerCount: 2 } },
  { id: 'spi', name: 'Spi', category: 'MCAL', description: 'SPI 串行外设驱动', icon: <Settings className="w-4 h-4" />, configurable: true, dependencies: ['mcu'], defaultConfig: { ChannelCount: 4 } },
  { id: 'adc', name: 'Adc', category: 'MCAL', description: '模拟采集驱动', icon: <Settings className="w-4 h-4" />, configurable: true, dependencies: ['mcu'], defaultConfig: { Resolution: 12, ChannelCount: 8 } },
  { id: 'pwm', name: 'Pwm', category: 'MCAL', description: 'PWM 脉冲输出驱动', icon: <Settings className="w-4 h-4" />, configurable: true, dependencies: ['mcu'], defaultConfig: { ChannelCount: 4, Frequency: 1000 } },
  
  // ECUAL 层
  { id: 'canif', name: 'CanIf', category: 'ECUAL', description: 'CAN 接口层', icon: <Network className="w-4 h-4" />, configurable: true, dependencies: ['can'], defaultConfig: { HohCount: 4, TxConfirmation: true } },
  { id: 'cantp', name: 'CanTp', category: 'ECUAL', description: 'CAN 传输层', icon: <Network className="w-4 h-4" />, configurable: true, dependencies: ['canif'], defaultConfig: { ChannelCount: 2 } },
  { id: 'iohwab', name: 'IoHwAb', category: 'ECUAL', description: 'IO 硬件抽象层', icon: <Settings className="w-4 h-4" />, configurable: true, dependencies: ['dio', 'adc', 'pwm'], defaultConfig: {} },
  { id: 'memif', name: 'MemIf', category: 'ECUAL', description: '存储接口层', icon: <Database className="w-4 h-4" />, configurable: true, dependencies: [], defaultConfig: {} },
  { id: 'fee', name: 'Fee', category: 'ECUAL', description: 'Flash EEPROM 仿真', icon: <Database className="w-4 h-4" />, configurable: true, dependencies: ['memif'], defaultConfig: { BlockCount: 32 } },
  { id: 'ea', name: 'Ea', category: 'ECUAL', description: 'EEPROM 抽象层', icon: <Database className="w-4 h-4" />, configurable: true, dependencies: ['memif'], defaultConfig: {} },
  
  // Service 层
  { id: 'com', name: 'Com', category: 'Service', description: '通信服务', icon: <Network className="w-4 h-4" />, configurable: true, dependencies: ['canif'], defaultConfig: { SignalCount: 64, PduCount: 16 } },
  { id: 'pdur', name: 'PduR', category: 'Service', description: 'PDU 路由器', icon: <Network className="w-4 h-4" />, configurable: true, dependencies: ['com', 'canif'], defaultConfig: { RoutingPathCount: 16 } },
  { id: 'nvm', name: 'NvM', category: 'Service', description: '非易失存储管理', icon: <Database className="w-4 h-4" />, configurable: true, dependencies: ['memif'], defaultConfig: { BlockCount: 64, WriteCycle: 100000 } },
  { id: 'dcm', name: 'Dcm', category: 'Service', description: '诊断通信管理', icon: <Settings className="w-4 h-4" />, configurable: true, dependencies: ['pdur'], defaultConfig: { DidCount: 32, RidCount: 8 } },
  { id: 'dem', name: 'Dem', category: 'Service', description: '事件诊断管理', icon: <AlertCircle className="w-4 h-4" />, configurable: true, dependencies: ['dcm'], defaultConfig: { EventCount: 64, DTCCount: 32 } },
  
  // RTE 层
  { id: 'rte', name: 'RTE', category: 'RTE', description: '运行时环境', icon: <Layers className="w-4 h-4" />, configurable: true, dependencies: ['com', 'os'], defaultConfig: { ComponentCount: 16, InterfaceCount: 32 } },
];

// 模块配置参数定义
const MODULE_CONFIGS: Record<string, ConfigParam[]> = {
  mcu: [
    { name: 'ClockSource', type: 'select', label: '时钟源', description: '系统时钟源选择', defaultValue: 'PLL', options: ['PLL', 'OSC', 'IRC'] },
    { name: 'SysTick', type: 'boolean', label: '系统时钟', description: '启用 SysTick 定时器', defaultValue: true },
    { name: 'ClockFreq', type: 'number', label: '时钟频率(MHz)', description: 'CPU 主时钟频率', defaultValue: 800, min: 16, max: 1000 },
  ],
  can: [
    { name: 'Baudrate', type: 'select', label: '波特率', description: 'CAN 通信波特率', defaultValue: 500000, options: ['125000', '250000', '500000', '1000000'] },
    { name: 'ControllerCount', type: 'number', label: '控制器数量', description: 'CAN 控制器个数', defaultValue: 2, min: 1, max: 8 },
    { name: 'RxQueueSize', type: 'number', label: '接收队列大小', description: '接收缓冲区大小', defaultValue: 64, min: 8, max: 256 },
    { name: 'TxQueueSize', type: 'number', label: '发送队列大小', description: '发送缓冲区大小', defaultValue: 32, min: 8, max: 128 },
  ],
  com: [
    { name: 'SignalCount', type: 'number', label: '信号数量', description: 'COM 信号总数', defaultValue: 64, min: 1, max: 512 },
    { name: 'PduCount', type: 'number', label: 'PDU 数量', description: 'PDU 总数', defaultValue: 16, min: 1, max: 128 },
    { name: 'TxConfirmation', type: 'boolean', label: '发送确认', description: '启用发送确认回调', defaultValue: true },
    { name: 'UpdateBit', type: 'boolean', label: '更新位', description: '启用更新位检查', defaultValue: true },
  ],
  pdur: [
    { name: 'RoutingPathCount', type: 'number', label: '路由路径数', description: 'PDU 路由路径总数', defaultValue: 16, min: 1, max: 256 },
    { name: 'GatewaySupport', type: 'boolean', label: '网关支持', description: '启用 PDU 网关功能', defaultValue: true },
  ],
  nvm: [
    { name: 'BlockCount', type: 'number', label: 'Block 数量', description: 'NVRAM Block 总数', defaultValue: 64, min: 1, max: 512 },
    { name: 'WriteCycle', type: 'number', label: '写入周期', description: '默认写入周期数', defaultValue: 100000, min: 1000, max: 1000000 },
    { name: 'CrcSupport', type: 'boolean', label: 'CRC 校验', description: '启用 CRC 校验', defaultValue: true },
  ],
};

export function BSWConfigurator() {
  const [selectedModules, setSelectedModules] = useState<string[]>(['mcu', 'port', 'dio', 'can', 'canif', 'com']);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [configs, setConfigs] = useState<Record<string, Record<string, any>>>({});
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['MCAL', 'ECUAL', 'Service', 'RTE']);
  const [showPreview, setShowPreview] = useState(false);

  // 初始化配置
  const getModuleConfig = (moduleId: string): Record<string, any> => {
    const module = BSW_MODULES.find(m => m.id === moduleId);
    if (!module) return {};
    
    const savedConfig = configs[moduleId];
    if (savedConfig) return savedConfig;
    
    // 使用默认配置
    const defaultConfig = { ...module.defaultConfig };
    const configParams = MODULE_CONFIGS[moduleId] || [];
    configParams.forEach(param => {
      if (!(param.name in defaultConfig)) {
        defaultConfig[param.name] = param.defaultValue;
      }
    });
    return defaultConfig;
  };

  // 添加模块
  const addModule = (moduleId: string) => {
    if (!selectedModules.includes(moduleId)) {
      setSelectedModules([...selectedModules, moduleId]);
      setActiveModule(moduleId);
    }
  };

  // 移除模块
  const removeModule = (moduleId: string) => {
    setSelectedModules(selectedModules.filter(id => id !== moduleId));
    if (activeModule === moduleId) {
      setActiveModule(null);
    }
  };

  // 更新配置
  const updateConfig = (moduleId: string, paramName: string, value: string | number | boolean) => {
    setConfigs(prev => ({
      ...prev,
      [moduleId]: {
        ...getModuleConfig(moduleId),
        [paramName]: value
      }
    }));
  };

  // 切换类别展开
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // 检查依赖关系
  const checkDependencies = (moduleId: string): { satisfied: boolean; missing: string[] } => {
    const module = BSW_MODULES.find(m => m.id === moduleId);
    if (!module) return { satisfied: true, missing: [] };
    
    const missing = module.dependencies.filter(dep => !selectedModules.includes(dep));
    return { satisfied: missing.length === 0, missing };
  };

  // 生成配置文件
  const generateConfig = () => {
    const config: Record<string, any> = {
      project: 'YuleTech_BSW_Config',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      modules: {}
    };

    selectedModules.forEach(moduleId => {
      const module = BSW_MODULES.find(m => m.id === moduleId);
      if (module) {
        config.modules[moduleId] = {
          name: module.name,
          category: module.category,
          enabled: true,
          configuration: getModuleConfig(moduleId)
        };
      }
    });

    return config;
  };

  // 下载配置
  const downloadConfig = () => {
    const config = generateConfig();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bsw_config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 重置配置
  const resetConfig = () => {
    if (confirm('确定要重置所有配置吗？')) {
      setSelectedModules([]);
      setConfigs({});
      setActiveModule(null);
    }
  };

  // 按类别分组的模块
  const groupedModules = BSW_MODULES.reduce((acc, module) => {
    if (!acc[module.category]) acc[module.category] = [];
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, BSWModule[]>);

  const categories = ['MCAL', 'ECUAL', 'Service', 'RTE'];
  const categoryLabels: Record<string, string> = {
    MCAL: 'MCAL - 微控制器驱动层',
    ECUAL: 'ECUAL - ECU 抽象层',
    Service: 'Service - 服务层',
    RTE: 'RTE - 运行时环境'
  };

  return (
    <div className="w-full bg-card rounded-xl border border-border overflow-hidden">
      {/* 头部工具栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">BSW 配置可视化工具</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {selectedModules.length} 个模块
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
          >
            {showPreview ? '隐藏预览' : '显示预览'}
          </button>
          <button
            onClick={resetConfig}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
          <button
            onClick={downloadConfig}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            导出配置
          </button>
        </div>
      </div>

      <div className="flex" style={{ minHeight: '500px' }}>
        {/* 左侧模块列表 */}
        <div className="w-64 border-r border-border bg-muted/10">
          <div className="p-3 border-b border-border">
            <h4 className="text-sm font-medium text-muted-foreground">可用模块</h4>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '450px' }}>
            {categories.map(category => (
              <div key={category}>
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
                >
                  {expandedCategories.includes(category) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span className="text-xs text-muted-foreground">{categoryLabels[category]}</span>
                </button>
                {expandedCategories.includes(category) && (
                  <div className="pb-2">
                    {groupedModules[category]?.map(module => {
                      const isSelected = selectedModules.includes(module.id);
                      const depCheck = checkDependencies(module.id);
                      const canAdd = !isSelected && depCheck.satisfied;
                      
                      return (
                        <div
                          key={module.id}
                          className={`flex items-center gap-2 px-4 py-2 text-sm cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-primary/10 text-primary' 
                              : canAdd 
                                ? 'hover:bg-muted/50 text-foreground'
                                : 'text-muted-foreground/50 cursor-not-allowed'
                          }`}
                          onClick={() => {
                            if (isSelected) {
                              removeModule(module.id);
                            } else if (canAdd) {
                              addModule(module.id);
                            }
                          }}
                        >
                          {isSelected ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Plus className={`w-4 h-4 ${!canAdd && 'opacity-30'}`} />
                          )}
                          <span className="text-muted-foreground">{module.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{module.name}</div>
                            <div className="text-xs text-muted-foreground/70 truncate">{module.description}</div>
                          </div>
                          {!depCheck.satisfied && !isSelected && (
                            <span title={`缺少依赖: ${depCheck.missing.join(', ')}`}>
                              <AlertCircle className="w-3 h-3 text-destructive" />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 中间已选模块列表 */}
        <div className="w-56 border-r border-border">
          <div className="p-3 border-b border-border">
            <h4 className="text-sm font-medium text-muted-foreground">已选模块</h4>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '450px' }}>
            {selectedModules.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                尚未选择模块
              </div>
            ) : (
              selectedModules.map(moduleId => {
                const module = BSW_MODULES.find(m => m.id === moduleId);
                if (!module) return null;
                
                return (
                  <div
                    key={moduleId}
                    onClick={() => setActiveModule(moduleId)}
                    className={`flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                      activeModule === moduleId 
                        ? 'bg-primary/10 border-l-2 border-primary' 
                        : 'hover:bg-muted/30 border-l-2 border-transparent'
                    }`}
                  >
                    <span className="text-muted-foreground">{module.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{module.name}</div>
                      <div className="text-xs text-muted-foreground/70">{module.category}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeModule(moduleId);
                      }}
                      className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 右侧配置面板 */}
        <div className="flex-1 p-4">
          {activeModule ? (
            <div>
              {(() => {
                const module = BSW_MODULES.find(m => m.id === activeModule);
                const configParams = MODULE_CONFIGS[activeModule] || [];
                const currentConfig = getModuleConfig(activeModule);
                
                return (
                  <div>
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {module?.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold">{module?.name}</h4>
                        <p className="text-sm text-muted-foreground">{module?.description}</p>
                      </div>
                    </div>

                    {configParams.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Settings className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>该模块暂无可配置参数</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {configParams.map(param => (
                          <div key={param.name} className="p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center justify-between mb-2">
                              <label className="font-medium text-sm">{param.label}</label>
                              {param.type === 'boolean' && (
                                <button
                                  onClick={() => updateConfig(activeModule, param.name, !currentConfig[param.name])}
                                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                    currentConfig[param.name] ? 'bg-primary' : 'bg-muted'
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                      currentConfig[param.name] ? 'translate-x-5' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{param.description}</p>
                            
                            {param.type === 'select' && (
                              <select
                                value={currentConfig[param.name]}
                                onChange={(e) => updateConfig(activeModule, param.name, e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                              >
                                {param.options?.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            )}
                            
                            {param.type === 'number' && (
                              <div className="flex items-center gap-3">
                                <input
                                  type="range"
                                  min={param.min}
                                  max={param.max}
                                  value={currentConfig[param.name]}
                                  onChange={(e) => updateConfig(activeModule, param.name, parseInt(e.target.value))}
                                  className="flex-1"
                                />
                                <input
                                  type="number"
                                  min={param.min}
                                  max={param.max}
                                  value={currentConfig[param.name]}
                                  onChange={(e) => updateConfig(activeModule, param.name, parseInt(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 text-sm rounded-lg bg-background border border-border text-center"
                                />
                              </div>
                            )}
                            
                            {param.type === 'text' && (
                              <input
                                type="text"
                                value={currentConfig[param.name]}
                                onChange={(e) => updateConfig(activeModule, param.name, e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Layers className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-sm">选择左侧模块开始配置</p>
            </div>
          )}
        </div>

        {/* 配置预览 */}
        {showPreview && (
          <div className="w-80 border-l border-border bg-muted/5 p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Database className="w-4 h-4" />
              配置预览
            </h4>
            <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto" style={{ maxHeight: '400px' }}>
              {JSON.stringify(generateConfig(), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
