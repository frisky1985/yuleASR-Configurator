import { useState, useRef, useMemo } from 'react';
import { 
  GitGraph, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  X,
  Download
} from 'lucide-react';

// 模块节点定义
interface ModuleNode {
  id: string;
  name: string;
  category: 'MCAL' | 'ECUAL' | 'Service' | 'RTE' | 'APP';
  description: string;
  x: number;
  y: number;
  status: 'stable' | 'beta' | 'alpha' | 'planned';
  completion: number;
  dependencies: string[];
}

// 连线定义
interface DependencyEdge {
  from: string;
  to: string;
  type: 'hard' | 'soft' | 'optional';
}

// BSW 模块数据
const MODULES: ModuleNode[] = [
  // MCAL Layer
  { id: 'mcu', name: 'Mcu', category: 'MCAL', description: '微控制器驱动', x: 100, y: 500, status: 'stable', completion: 100, dependencies: [] },
  { id: 'port', name: 'Port', category: 'MCAL', description: 'GPIO 端口驱动', x: 200, y: 500, status: 'stable', completion: 100, dependencies: ['mcu'] },
  { id: 'dio', name: 'Dio', category: 'MCAL', description: '数字 IO 驱动', x: 300, y: 500, status: 'stable', completion: 100, dependencies: ['port'] },
  { id: 'can', name: 'Can', category: 'MCAL', description: 'CAN 控制器', x: 400, y: 500, status: 'stable', completion: 95, dependencies: ['mcu'] },
  { id: 'spi', name: 'Spi', category: 'MCAL', description: 'SPI 驱动', x: 500, y: 500, status: 'stable', completion: 90, dependencies: ['mcu'] },
  { id: 'adc', name: 'Adc', category: 'MCAL', description: 'ADC 驱动', x: 600, y: 500, status: 'beta', completion: 80, dependencies: ['mcu'] },
  { id: 'pwm', name: 'Pwm', category: 'MCAL', description: 'PWM 驱动', x: 700, y: 500, status: 'beta', completion: 75, dependencies: ['mcu'] },
  { id: 'gpt', name: 'Gpt', category: 'MCAL', description: '通用定时器', x: 800, y: 500, status: 'stable', completion: 100, dependencies: ['mcu'] },
  
  // ECUAL Layer
  { id: 'canif', name: 'CanIf', category: 'ECUAL', description: 'CAN 接口层', x: 350, y: 350, status: 'stable', completion: 100, dependencies: ['can'] },
  { id: 'cantp', name: 'CanTp', category: 'ECUAL', description: 'CAN 传输层', x: 450, y: 350, status: 'stable', completion: 90, dependencies: ['canif'] },
  { id: 'iohwab', name: 'IoHwAb', category: 'ECUAL', description: 'IO 抽象层', x: 250, y: 350, status: 'stable', completion: 85, dependencies: ['dio', 'adc', 'pwm'] },
  { id: 'memif', name: 'MemIf', category: 'ECUAL', description: '存储接口', x: 650, y: 350, status: 'stable', completion: 100, dependencies: [] },
  { id: 'fee', name: 'Fee', category: 'ECUAL', description: 'Flash EEPROM 仿真', x: 550, y: 350, status: 'beta', completion: 70, dependencies: ['memif'] },
  { id: 'ethif', name: 'EthIf', category: 'ECUAL', description: '以太网接口', x: 750, y: 350, status: 'alpha', completion: 40, dependencies: [] },
  
  // Service Layer
  { id: 'com', name: 'Com', category: 'Service', description: '通信服务', x: 350, y: 200, status: 'stable', completion: 95, dependencies: ['canif'] },
  { id: 'pdur', name: 'PduR', category: 'Service', description: 'PDU 路由器', x: 500, y: 200, status: 'stable', completion: 90, dependencies: ['com', 'canif'] },
  { id: 'nvm', name: 'NvM', category: 'Service', description: '非易失存储', x: 650, y: 200, status: 'stable', completion: 85, dependencies: ['memif'] },
  { id: 'dcm', name: 'Dcm', category: 'Service', description: '诊断通信', x: 200, y: 200, status: 'beta', completion: 75, dependencies: ['pdur'] },
  { id: 'dem', name: 'Dem', category: 'Service', description: '事件诊断', x: 800, y: 200, status: 'beta', completion: 70, dependencies: ['dcm'] },
  { id: 'nm', name: 'Nm', category: 'Service', description: '网络管理', x: 100, y: 200, status: 'alpha', completion: 50, dependencies: ['com'] },
  
  // RTE Layer
  { id: 'rte', name: 'RTE', category: 'RTE', description: '运行时环境', x: 450, y: 100, status: 'stable', completion: 90, dependencies: ['com', 'os'] },
  { id: 'os', name: 'OS', category: 'Service', description: '操作系统', x: 300, y: 100, status: 'stable', completion: 95, dependencies: [] },
  
  // Application Layer
  { id: 'swc1', name: 'EngineControl', category: 'APP', description: '发动机控制', x: 200, y: 50, status: 'planned', completion: 30, dependencies: ['rte'] },
  { id: 'swc2', name: 'VehicleDynamics', category: 'APP', description: '车辆动力学', x: 400, y: 50, status: 'planned', completion: 20, dependencies: ['rte'] },
  { id: 'swc3', name: 'DiagnosticMgr', category: 'APP', description: '诊断管理', x: 600, y: 50, status: 'planned', completion: 25, dependencies: ['rte', 'dcm'] },
];

const CATEGORY_COLORS = {
  MCAL: '#3b82f6',
  ECUAL: '#10b981',
  Service: '#8b5cf6',
  RTE: '#f59e0b',
  APP: '#ec4899'
};

const CATEGORY_NAMES = {
  MCAL: 'MCAL - 微控制器驱动',
  ECUAL: 'ECUAL - ECU抽象层',
  Service: 'Service - 服务层',
  RTE: 'RTE - 运行时环境',
  APP: 'ASW - 应用软件'
};

const STATUS_COLORS = {
  stable: '#22c55e',
  beta: '#f59e0b',
  alpha: '#ef4444',
  planned: '#6b7280'
};

export function DependencyGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 50, y: 50 });
  const [selectedNode, setSelectedNode] = useState<ModuleNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(new Set(['MCAL', 'ECUAL', 'Service', 'RTE', 'APP']));
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 计算连线
  const edges = useMemo(() => {
    const edgeList: DependencyEdge[] = [];
    MODULES.forEach(module => {
      module.dependencies.forEach(depId => {
        edgeList.push({ from: depId, to: module.id, type: 'hard' });
      });
    });
    return edgeList;
  }, []);

  // 过滤显示的模块
  const visibleModules = useMemo(() => {
    return MODULES.filter(m => visibleCategories.has(m.category));
  }, [visibleCategories]);

  // 缩放控制
  const handleZoomIn = () => setScale(s => Math.min(s * 1.2, 3));
  const handleZoomOut = () => setScale(s => Math.max(s / 1.2, 0.5));
  const handleReset = () => {
    setScale(1);
    setTranslate({ x: 50, y: 50 });
  };

  // 拖拽平移
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setTranslate({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // 切换图层显示
  const toggleCategory = (category: string) => {
    setVisibleCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // 导出图片
  const exportImage = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 600;
      ctx?.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = 'bsw-dependency-graph.png';
      link.href = canvas.toDataURL();
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="w-full bg-card rounded-xl border border-border overflow-hidden">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <GitGraph className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">BSW 依赖关系图</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {MODULES.length} 个模块
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleZoomOut} className="p-2 rounded-lg hover:bg-muted transition-colors" title="缩小">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted-foreground w-12 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={handleZoomIn} className="p-2 rounded-lg hover:bg-muted transition-colors" title="放大">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleReset} className="p-2 rounded-lg hover:bg-muted transition-colors" title="重置">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button onClick={exportImage} className="p-2 rounded-lg hover:bg-muted transition-colors" title="导出">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex" style={{ minHeight: '500px' }}>
        {/* 图层控制 */}
        <div className="w-48 border-r border-border bg-muted/10 p-4">
          <div className="text-sm font-medium mb-3">图层控制</div>
          <div className="space-y-2">
            {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleCategories.has(key)}
                  onChange={() => toggleCategory(key)}
                  className="rounded border-border"
                />
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS] }} />
                <span className="text-xs">{name.split(' - ')[0]}</span>
              </label>
            ))}
          </div>

          {/* 图例 */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="text-xs font-medium mb-2">状态图例</div>
            <div className="space-y-1.5">
              {[
                { status: 'stable', label: '稳定' },
                { status: 'beta', label: '测试' },
                { status: 'alpha', label: '内测' },
                { status: 'planned', label: '规划' }
              ].map(({ status, label }) => (
                <div key={status} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS] }} />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 统计 */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="text-xs font-medium mb-2">统计</div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>总模块:</span>
                <span>{MODULES.length}</span>
              </div>
              <div className="flex justify-between">
                <span>依赖关系:</span>
                <span>{edges.length}</span>
              </div>
              <div className="flex justify-between">
                <span>已完成:</span>
                <span>{MODULES.filter(m => m.status === 'stable').length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 图表区域 */}
        <div className="flex-1 relative overflow-hidden bg-muted/5">
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="0 0 1000 600"
            className="cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" opacity="0.6" />
              </marker>
              <marker id="arrowhead-highlight" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
              </marker>
            </defs>
            
            <g transform={`translate(${translate.x}, ${translate.y}) scale(${scale})`}>
              {/* 连线 */}
              {edges.map((edge, index) => {
                const fromNode = MODULES.find(m => m.id === edge.from);
                const toNode = MODULES.find(m => m.id === edge.to);
                if (!fromNode || !toNode) return null;
                if (!visibleCategories.has(fromNode.category) || !visibleCategories.has(toNode.category)) return null;
                
                const isHighlighted = hoveredNode === edge.from || hoveredNode === edge.to || selectedNode?.id === edge.from || selectedNode?.id === edge.to;
                
                return (
                  <line
                    key={index}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={isHighlighted ? '#3b82f6' : '#94a3b8'}
                    strokeWidth={isHighlighted ? 2 : 1}
                    opacity={isHighlighted ? 1 : 0.4}
                    markerEnd={isHighlighted ? 'url(#arrowhead-highlight)' : 'url(#arrowhead)'}
                  />
                );
              })}
              
              {/* 模块节点 */}
              {visibleModules.map(module => {
                const isSelected = selectedNode?.id === module.id;
                const isHovered = hoveredNode === module.id;
                const hasHighlight = isSelected || isHovered;
                
                return (
                  <g
                    key={module.id}
                    transform={`translate(${module.x}, ${module.y})`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredNode(module.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => setSelectedNode(module)}
                  >
                    {/* 外发光 */}
                    {(hasHighlight) && (
                      <circle
                        r="28"
                        fill={CATEGORY_COLORS[module.category]}
                        opacity="0.2"
                      />
                    )}
                    
                    {/* 主圆 */}
                    <circle
                      r="22"
                      fill={CATEGORY_COLORS[module.category]}
                      stroke={hasHighlight ? '#fff' : 'transparent'}
                      strokeWidth={hasHighlight ? 3 : 0}
                      opacity={module.status === 'planned' ? 0.5 : 1}
                    />
                    
                    {/* 状态指示点 */}
                    <circle
                      cx="14"
                      cy="-14"
                      r="5"
                      fill={STATUS_COLORS[module.status]}
                      stroke="#fff"
                      strokeWidth="1"
                    />
                    
                    {/* 完成度环 */}
                    <circle
                      r="26"
                      fill="none"
                      stroke={CATEGORY_COLORS[module.category]}
                      strokeWidth="2"
                      strokeDasharray={`${module.completion * 1.63} 163`}
                      transform="rotate(-90)"
                      opacity="0.5"
                    />
                    
                    {/* 模块名 */}
                    <text
                      y="35"
                      textAnchor="middle"
                      className="text-xs font-medium"
                      fill="currentColor"
                      style={{ fontSize: '11px' }}
                    >
                      {module.name}
                    </text>
                  </g>
                );
              })}
              
              {/* 层级标签 */}
              {[
                { y: 500, label: 'MCAL Layer', color: CATEGORY_COLORS.MCAL },
                { y: 350, label: 'ECUAL Layer', color: CATEGORY_COLORS.ECUAL },
                { y: 200, label: 'Service Layer', color: CATEGORY_COLORS.Service },
                { y: 100, label: 'RTE & OS', color: CATEGORY_COLORS.RTE },
                { y: 50, label: 'Application', color: CATEGORY_COLORS.APP }
              ].map(({ y, label, color }) => (
                visibleCategories.has(label.split(' ')[0] as any) && (
                  <g key={label} transform={`translate(20, ${y})`}>
                    <rect x="-10" y="-10" width="100" height="20" fill={color} opacity="0.1" rx="4" />
                    <text x="0" y="4" fill={color} style={{ fontSize: '12px', fontWeight: 600 }}>
                      {label}
                    </text>
                  </g>
                )
              ))}
            </g>
          </svg>

          {/* 悬浮提示 */}
          {hoveredNode && !selectedNode && (
            <div className="absolute top-4 right-4 bg-card border border-border rounded-lg p-3 shadow-lg max-w-xs">
              {(() => {
                const module = MODULES.find(m => m.id === hoveredNode);
                if (!module) return null;
                return (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[module.category] }} />
                      <span className="font-semibold">{module.name}</span>
                      <span className="text-xs text-muted-foreground">({module.category})</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{module.description}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="px-1.5 py-0.5 rounded bg-muted">完成度: {module.completion}%</span>
                      <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: STATUS_COLORS[module.status], color: '#fff' }}>
                        {module.status}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* 详情面板 */}
        {selectedNode && (
          <div className="w-72 border-l border-border bg-muted/10 p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">模块详情</h4>
              <button 
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: CATEGORY_COLORS[selectedNode.category] }}
                >
                  {selectedNode.name.slice(0, 2)}
                </span>
                <div>
                  <div className="font-semibold">{selectedNode.name}</div>
                  <div className="text-xs text-muted-foreground">{CATEGORY_NAMES[selectedNode.category]}</div>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground mb-1">描述</div>
                <p className="text-sm">{selectedNode.description}</p>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground mb-1">开发状态</div>
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: STATUS_COLORS[selectedNode.status] }} 
                  />
                  <span className="text-sm capitalize">{selectedNode.status}</span>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground mb-1">完成度</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${selectedNode.completion}%`,
                        backgroundColor: CATEGORY_COLORS[selectedNode.category]
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right">{selectedNode.completion}%</span>
                </div>
              </div>
              
              {selectedNode.dependencies.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">依赖模块</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.dependencies.map(depId => {
                      const dep = MODULES.find(m => m.id === depId);
                      return dep ? (
                        <span 
                          key={depId}
                          className="px-2 py-0.5 text-xs rounded bg-muted cursor-pointer hover:bg-muted/80"
                          onClick={() => setSelectedNode(dep)}
                        >
                          {dep.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              
              {/* 被依赖 */}
              {(() => {
                const dependents = MODULES.filter(m => m.dependencies.includes(selectedNode.id));
                if (dependents.length === 0) return null;
                return (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">被依赖于</div>
                    <div className="flex flex-wrap gap-1">
                      {dependents.map(dep => (
                        <span 
                          key={dep.id}
                          className="px-2 py-0.5 text-xs rounded bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                          onClick={() => setSelectedNode(dep)}
                        >
                          {dep.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
