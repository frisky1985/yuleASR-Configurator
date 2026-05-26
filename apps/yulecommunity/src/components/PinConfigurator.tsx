import { useState, useMemo } from 'react';
import { 
  Cpu, 
  Settings, 
  Download, 
  RotateCcw,
  Check,
  AlertCircle,
  MousePointer2,
  Zap,
  Activity,
  Radio,
  Usb,
  Monitor,
  Share2,
  Copy
} from 'lucide-react';

// 引脚功能类型
 type PinFunction = 
  | 'GPIO' 
  | 'CAN_TX' | 'CAN_RX' | 'CAN1_TX' | 'CAN1_RX' | 'CAN2_TX' | 'CAN2_RX'
  | 'SPI_MOSI' | 'SPI_MISO' | 'SPI_SCK' | 'SPI_CS' | 'SPI1_MOSI' | 'SPI1_MISO' | 'SPI1_SCK' | 'SPI1_CS' | 'SPI2_MOSI' | 'SPI2_MISO' | 'SPI2_SCK' | 'SPI2_CS'
  | 'UART_TX' | 'UART_RX' | 'UART_RTS' | 'UART_CTS' | 'UART1_TX' | 'UART1_RX' | 'UART2_TX' | 'UART2_RX' | 'UART3_TX' | 'UART3_RX' | 'UART4_TX' | 'UART4_RX'
  | 'I2C_SDA' | 'I2C_SCL' | 'I2C1_SDA' | 'I2C1_SCL' | 'I2C2_SDA' | 'I2C2_SCL'
  | 'PWM' | 'PWM1' | 'PWM2' | 'PWM3' | 'PWM4' | 'ADC' | 'ETH'
  | 'USB_DP' | 'USB_DM'
  | 'RESET' | 'POWER' | 'GND' | 'NC';

// 引脚定义
interface Pin {
  id: string;
  number: number;
  name: string;
  functions: PinFunction[];
  defaultFunction: PinFunction;
  currentFunction: PinFunction;
  config?: Record<string, string | number | boolean>;
  isConfigurable: boolean;
}

// 开发板定义
interface Board {
  id: string;
  name: string;
  chip: string;
  description: string;
  pins: Pin[];
}

// 开发板引脚配置
const IMX8M_PINS: Pin[] = [
  // 电源和复位
  { id: 'VDD_1', number: 1, name: 'VDD_3V3', functions: ['POWER'], defaultFunction: 'POWER', currentFunction: 'POWER', isConfigurable: false },
  { id: 'VDD_2', number: 2, name: 'VDD_5V', functions: ['POWER'], defaultFunction: 'POWER', currentFunction: 'POWER', isConfigurable: false },
  { id: 'GND_3', number: 3, name: 'GND', functions: ['GND'], defaultFunction: 'GND', currentFunction: 'GND', isConfigurable: false },
  { id: 'RST_4', number: 4, name: 'RESETn', functions: ['RESET'], defaultFunction: 'RESET', currentFunction: 'RESET', isConfigurable: false },
  
  // GPIO1 组
  { id: 'GPIO1_0', number: 5, name: 'GPIO1_IO00', functions: ['GPIO', 'UART1_TX', 'CAN1_TX'], defaultFunction: 'GPIO', currentFunction: 'GPIO', isConfigurable: true },
  { id: 'GPIO1_1', number: 6, name: 'GPIO1_IO01', functions: ['GPIO', 'UART1_RX', 'CAN1_RX'], defaultFunction: 'GPIO', currentFunction: 'GPIO', isConfigurable: true },
  { id: 'GPIO1_2', number: 7, name: 'GPIO1_IO02', functions: ['GPIO', 'UART2_TX', 'PWM1'], defaultFunction: 'GPIO', currentFunction: 'GPIO', isConfigurable: true },
  { id: 'GPIO1_3', number: 8, name: 'GPIO1_IO03', functions: ['GPIO', 'UART2_RX', 'PWM2'], defaultFunction: 'GPIO', currentFunction: 'GPIO', isConfigurable: true },
  { id: 'GPIO1_4', number: 9, name: 'GPIO1_IO04', functions: ['GPIO', 'I2C1_SCL', 'SPI1_CS'], defaultFunction: 'GPIO', currentFunction: 'GPIO', isConfigurable: true },
  { id: 'GPIO1_5', number: 10, name: 'GPIO1_IO05', functions: ['GPIO', 'I2C1_SDA', 'SPI1_SCK'], defaultFunction: 'GPIO', currentFunction: 'GPIO', isConfigurable: true },
  { id: 'GPIO1_6', number: 11, name: 'GPIO1_IO06', functions: ['GPIO', 'SPI1_MOSI', 'UART3_TX'], defaultFunction: 'GPIO', currentFunction: 'GPIO', isConfigurable: true },
  { id: 'GPIO1_7', number: 12, name: 'GPIO1_IO07', functions: ['GPIO', 'SPI1_MISO', 'UART3_RX'], defaultFunction: 'GPIO', currentFunction: 'GPIO', isConfigurable: true },
  
  // GPIO2 组
  { id: 'GPIO2_0', number: 13, name: 'GPIO2_IO00', functions: ['GPIO', 'CAN2_TX', 'PWM3'], defaultFunction: 'GPIO', currentFunction: 'GPIO', isConfigurable: true },
  { id: 'GPIO2_1', number: 14, name: 'GPIO2_IO01', functions: ['GPIO', 'CAN2_RX', 'PWM4'], defaultFunction: 'GPIO', currentFunction: 'GPIO', isConfigurable: true },
  { id: 'GPIO2_2', number: 15, name: 'GPIO2_IO02', functions: ['GPIO', 'I2C2_SCL', 'ADC'], defaultFunction: 'GPIO', currentFunction: 'GPIO', isConfigurable: true },
  { id: 'GPIO2_3', number: 16, name: 'GPIO2_IO03', functions: ['GPIO', 'I2C2_SDA', 'ADC'], defaultFunction: 'GPIO', currentFunction: 'GPIO', isConfigurable: true },
  { id: 'GPIO2_4', number: 17, name: 'GPIO2_IO04', functions: ['GPIO', 'SPI2_CS', 'UART4_TX'], defaultFunction: 'GPIO', currentFunction: 'GPIO', isConfigurable: true },
  { id: 'GPIO2_5', number: 18, name: 'GPIO2_IO05', functions: ['GPIO', 'SPI2_SCK', 'UART4_RX'], defaultFunction: 'GPIO', currentFunction: 'GPIO', isConfigurable: true },
  { id: 'GPIO2_6', number: 19, name: 'GPIO2_IO06', functions: ['GPIO', 'SPI2_MOSI', 'CAN1_TX'], defaultFunction: 'GPIO', currentFunction: 'GPIO', isConfigurable: true },
  { id: 'GPIO2_7', number: 20, name: 'GPIO2_IO07', functions: ['GPIO', 'SPI2_MISO', 'CAN1_RX'], defaultFunction: 'GPIO', currentFunction: 'GPIO', isConfigurable: true },
  
  // 以太网
  { id: 'ETH_0', number: 21, name: 'ENET_MDC', functions: ['ETH'], defaultFunction: 'ETH', currentFunction: 'ETH', isConfigurable: true },
  { id: 'ETH_1', number: 22, name: 'ENET_MDIO', functions: ['ETH'], defaultFunction: 'ETH', currentFunction: 'ETH', isConfigurable: true },
  { id: 'ETH_2', number: 23, name: 'ENET_TX_CLK', functions: ['ETH'], defaultFunction: 'ETH', currentFunction: 'ETH', isConfigurable: false },
  { id: 'ETH_3', number: 24, name: 'ENET_RX_CLK', functions: ['ETH'], defaultFunction: 'ETH', currentFunction: 'ETH', isConfigurable: false },
  { id: 'ETH_4', number: 25, name: 'ENET_TXD0', functions: ['ETH'], defaultFunction: 'ETH', currentFunction: 'ETH', isConfigurable: false },
  { id: 'ETH_5', number: 26, name: 'ENET_TXD1', functions: ['ETH'], defaultFunction: 'ETH', currentFunction: 'ETH', isConfigurable: false },
  { id: 'ETH_6', number: 27, name: 'ENET_RXD0', functions: ['ETH'], defaultFunction: 'ETH', currentFunction: 'ETH', isConfigurable: false },
  { id: 'ETH_7', number: 28, name: 'ENET_RXD1', functions: ['ETH'], defaultFunction: 'ETH', currentFunction: 'ETH', isConfigurable: false },
  
  // USB
  { id: 'USB_0', number: 29, name: 'USB_DP', functions: ['USB_DP'], defaultFunction: 'USB_DP', currentFunction: 'USB_DP', isConfigurable: false },
  { id: 'USB_1', number: 30, name: 'USB_DM', functions: ['USB_DM'], defaultFunction: 'USB_DM', currentFunction: 'USB_DM', isConfigurable: false },
  { id: 'USB_2', number: 31, name: 'USB_VBUS', functions: ['POWER'], defaultFunction: 'POWER', currentFunction: 'POWER', isConfigurable: false },
  { id: 'GND_4', number: 32, name: 'GND', functions: ['GND'], defaultFunction: 'GND', currentFunction: 'GND', isConfigurable: false },
];

const BOARDS: Board[] = [
  {
    id: 'imx8m-yule',
    name: 'YuleTech i.MX8M',
    chip: 'ARM Cortex-A53',
    description: 'YuleTech 开源开发板，支持 AutoSAR BSW 全功能',
    pins: IMX8M_PINS
  }
];

// 功能颜色映射
const functionColors: Record<PinFunction, string> = {
  'GPIO': 'bg-blue-500',
  'CAN_TX': 'bg-green-500', 'CAN_RX': 'bg-green-600',
  'CAN1_TX': 'bg-green-500', 'CAN1_RX': 'bg-green-600',
  'CAN2_TX': 'bg-green-500', 'CAN2_RX': 'bg-green-600',
  'SPI_MOSI': 'bg-purple-500', 'SPI_MISO': 'bg-purple-600', 'SPI_SCK': 'bg-purple-700', 'SPI_CS': 'bg-purple-400',
  'SPI1_MOSI': 'bg-purple-500', 'SPI1_MISO': 'bg-purple-600', 'SPI1_SCK': 'bg-purple-700', 'SPI1_CS': 'bg-purple-400',
  'SPI2_MOSI': 'bg-purple-500', 'SPI2_MISO': 'bg-purple-600', 'SPI2_SCK': 'bg-purple-700', 'SPI2_CS': 'bg-purple-400',
  'UART_TX': 'bg-orange-500', 'UART_RX': 'bg-orange-600', 'UART_RTS': 'bg-orange-400', 'UART_CTS': 'bg-orange-700',
  'UART1_TX': 'bg-orange-500', 'UART1_RX': 'bg-orange-600',
  'UART2_TX': 'bg-orange-500', 'UART2_RX': 'bg-orange-600',
  'UART3_TX': 'bg-orange-500', 'UART3_RX': 'bg-orange-600',
  'UART4_TX': 'bg-orange-500', 'UART4_RX': 'bg-orange-600',
  'I2C_SDA': 'bg-cyan-500', 'I2C_SCL': 'bg-cyan-600',
  'I2C1_SDA': 'bg-cyan-500', 'I2C1_SCL': 'bg-cyan-600',
  'I2C2_SDA': 'bg-cyan-500', 'I2C2_SCL': 'bg-cyan-600',
  'PWM': 'bg-pink-500', 'PWM1': 'bg-pink-500', 'PWM2': 'bg-pink-600', 'PWM3': 'bg-pink-500', 'PWM4': 'bg-pink-600',
  'ADC': 'bg-yellow-500',
  'ETH': 'bg-indigo-500',
  'USB_DP': 'bg-red-500', 'USB_DM': 'bg-red-600',
  'RESET': 'bg-gray-600',
  'POWER': 'bg-red-400',
  'GND': 'bg-gray-800',
  'NC': 'bg-gray-300'
};

const functionLabels: Record<PinFunction, string> = {
  'GPIO': 'GPIO',
  'CAN_TX': 'CAN TX', 'CAN_RX': 'CAN RX',
  'CAN1_TX': 'CAN1 TX', 'CAN1_RX': 'CAN1 RX',
  'CAN2_TX': 'CAN2 TX', 'CAN2_RX': 'CAN2 RX',
  'SPI_MOSI': 'SPI MOSI', 'SPI_MISO': 'SPI MISO', 'SPI_SCK': 'SPI SCK', 'SPI_CS': 'SPI CS',
  'SPI1_MOSI': 'SPI1 MOSI', 'SPI1_MISO': 'SPI1 MISO', 'SPI1_SCK': 'SPI1 SCK', 'SPI1_CS': 'SPI1 CS',
  'SPI2_MOSI': 'SPI2 MOSI', 'SPI2_MISO': 'SPI2 MISO', 'SPI2_SCK': 'SPI2 SCK', 'SPI2_CS': 'SPI2 CS',
  'UART_TX': 'UART TX', 'UART_RX': 'UART RX', 'UART_RTS': 'UART RTS', 'UART_CTS': 'UART CTS',
  'UART1_TX': 'UART1 TX', 'UART1_RX': 'UART1 RX',
  'UART2_TX': 'UART2 TX', 'UART2_RX': 'UART2 RX',
  'UART3_TX': 'UART3 TX', 'UART3_RX': 'UART3 RX',
  'UART4_TX': 'UART4 TX', 'UART4_RX': 'UART4 RX',
  'I2C_SDA': 'I2C SDA', 'I2C_SCL': 'I2C SCL',
  'I2C1_SDA': 'I2C1 SDA', 'I2C1_SCL': 'I2C1 SCL',
  'I2C2_SDA': 'I2C2 SDA', 'I2C2_SCL': 'I2C2 SCL',
  'PWM': 'PWM', 'PWM1': 'PWM1', 'PWM2': 'PWM2', 'PWM3': 'PWM3', 'PWM4': 'PWM4',
  'ADC': 'ADC',
  'ETH': 'Ethernet',
  'USB_DP': 'USB+', 'USB_DM': 'USB-',
  'RESET': 'Reset', 'POWER': 'Power', 'GND': 'GND', 'NC': 'NC'
};

export function PinConfigurator() {
  const selectedBoard = BOARDS[0];
  const [pins, setPins] = useState<Pin[]>(IMX8M_PINS);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [activeFilter, setActiveFilter] = useState<PinFunction | 'ALL'>('ALL');
  const [showGeneratedCode, setShowGeneratedCode] = useState(false);
  const [copied, setCopied] = useState(false);

  // 过滤引脚
  const filteredPins = useMemo(() => {
    if (activeFilter === 'ALL') return pins;
    return pins.filter(pin => pin.functions.includes(activeFilter) || pin.currentFunction === activeFilter);
  }, [pins, activeFilter]);

  // 更新引脚功能
  const updatePinFunction = (pinId: string, newFunction: PinFunction) => {
    setPins(prev => prev.map(pin => 
      pin.id === pinId ? { ...pin, currentFunction: newFunction } : pin
    ));
  };

  // 重置所有引脚
  const resetAllPins = () => {
    if (confirm('确定要重置所有引脚到默认状态吗？')) {
      setPins(prev => prev.map(pin => ({ ...pin, currentFunction: pin.defaultFunction })));
      setSelectedPin(null);
    }
  };

  // 生成配置代码
  const generateCode = (): string => {
    const configurablePins = pins.filter(p => p.isConfigurable);
    
    let code = `/*\n`;
    code += ` * ${selectedBoard.name} Pin Configuration\n`;
    code += ` * Generated by YuleTech Pin Configurator\n`;
    code += ` * Board: ${selectedBoard.name}\n`;
    code += ` * Chip: ${selectedBoard.chip}\n`;
    code += ` * Date: ${new Date().toISOString()}\n`;
    code += ` */\n\n`;
    
    code += `#ifndef PIN_CONFIG_H\n`;
    code += `#define PIN_CONFIG_H\n\n`;
    
    code += `/* Pin Mapping Configuration */\n`;
    configurablePins.forEach(pin => {
      if (pin.currentFunction !== 'GPIO') {
        code += `#define ${pin.name}_FUNC    ${pin.currentFunction.padEnd(12)} /* Pin ${pin.number} */\n`;
      }
    });
    
    code += `\n/* Port Configuration */\n`;
    code += `const Port_ConfigType Port_Config = {\n`;
    configurablePins.forEach(pin => {
      code += `    {\n`;
      code += `        .pinName = "${pin.name}",\n`;
      code += `        .pinNumber = ${pin.number},\n`;
      code += `        .function = ${pin.currentFunction},\n`;
      code += `        .direction = ${pin.currentFunction.includes('TX') || pin.currentFunction.includes('MOSI') ? 'PORT_PIN_OUT' : 'PORT_PIN_IN'},\n`;
      code += `        .mode = PORT_PIN_MODE_${pin.currentFunction.split('_')[0]}\n`;
      code += `    },\n`;
    });
    code += `};\n\n`;
    
    code += `#endif /* PIN_CONFIG_H */\n`;
    
    return code;
  };

  // 复制代码
  const copyCode = () => {
    navigator.clipboard.writeText(generateCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 下载配置
  const downloadConfig = () => {
    const code = generateCode();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pin_config.h';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 统计信息
  const stats = useMemo(() => {
    const used = pins.filter(p => p.isConfigurable && p.currentFunction !== 'GPIO').length;
    const total = pins.filter(p => p.isConfigurable).length;
    const byFunction: Record<string, number> = {};
    pins.forEach(pin => {
      if (pin.isConfigurable) {
        const func = pin.currentFunction;
        byFunction[func] = (byFunction[func] || 0) + 1;
      }
    });
    return { used, total, byFunction };
  }, [pins]);

  return (
    <div className="w-full bg-card rounded-xl border border-border overflow-hidden">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <Cpu className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">开发板引脚配置器</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {selectedBoard.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGeneratedCode(!showGeneratedCode)}
            className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
          >
            {showGeneratedCode ? '隐藏代码' : '生成代码'}
          </button>
          <button
            onClick={resetAllPins}
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

      <div className="flex" style={{ minHeight: '600px' }}>
        {/* 左侧引脚图 */}
        <div className="flex-1 p-6 bg-muted/5 overflow-auto">
          {/* 筛选器 */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                activeFilter === 'ALL' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              全部
            </button>
            {['GPIO', 'CAN', 'SPI', 'UART', 'I2C', 'PWM', 'ADC', 'ETH'].map(func => (
              <button
                key={func}
                onClick={() => setActiveFilter(func as PinFunction)}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  activeFilter === func ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {func}
              </button>
            ))}
          </div>

          {/* 引脚网格 */}
          <div className="grid grid-cols-4 gap-2">
            {filteredPins.map(pin => {
              const isSelected = selectedPin?.id === pin.id;
              const isActive = activeFilter !== 'ALL' && (pin.functions.includes(activeFilter) || pin.currentFunction === activeFilter);
              
              return (
                <button
                  key={pin.id}
                  onClick={() => setSelectedPin(pin)}
                  disabled={!pin.isConfigurable}
                  className={`
                    relative p-2 rounded-lg border text-left transition-all
                    ${!pin.isConfigurable ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
                    ${isSelected ? 'ring-2 ring-primary border-primary' : 'border-border'}
                    ${isActive ? 'ring-1 ring-primary/50' : ''}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${functionColors[pin.currentFunction]}`} />
                    <span className="text-xs font-mono text-muted-foreground">{pin.number}</span>
                  </div>
                  <div className="mt-1 text-xs font-medium truncate">{pin.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {functionLabels[pin.currentFunction]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 图例 */}
          <div className="mt-6 p-3 bg-muted/30 rounded-lg">
            <div className="text-xs font-medium mb-2">功能图例</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(functionColors)
                .filter(([func]) => !['RESET', 'POWER', 'GND', 'NC', 'USB_DP', 'USB_DM'].includes(func))
                .map(([func, color]) => (
                  <div key={func} className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-[10px] text-muted-foreground">{functionLabels[func as PinFunction]}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* 右侧配置面板 */}
        <div className="w-80 border-l border-border bg-muted/10 p-4">
          {selectedPin ? (
            <div>
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MousePointer2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold">{selectedPin.name}</h4>
                  <p className="text-xs text-muted-foreground">引脚 #{selectedPin.number}</p>
                </div>
              </div>

              {selectedPin.isConfigurable ? (
                <div className="space-y-3">
                  <div className="text-xs font-medium text-muted-foreground">可用功能</div>
                  <div className="space-y-1">
                    {selectedPin.functions.map(func => (
                      <button
                        key={func}
                        onClick={() => updatePinFunction(selectedPin.id, func)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedPin.currentFunction === func 
                            ? 'bg-primary/10 text-primary border border-primary/30' 
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${functionColors[func]}`} />
                        <span className="flex-1 text-left">{functionLabels[func]}</span>
                        {selectedPin.currentFunction === func && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>

                  {/* 功能说明 */}
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                    {selectedPin.currentFunction.startsWith('CAN') && (
                      <div className="flex items-start gap-2">
                        <Share2 className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>CAN 通信引脚，用于汽车网络通信</span>
                      </div>
                    )}
                    {selectedPin.currentFunction.startsWith('SPI') && (
                      <div className="flex items-start gap-2">
                        <Zap className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>SPI 串行外设接口，高速同步通信</span>
                      </div>
                    )}
                    {selectedPin.currentFunction.startsWith('UART') && (
                      <div className="flex items-start gap-2">
                        <Activity className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>UART 异步串口，用于调试和通信</span>
                      </div>
                    )}
                    {selectedPin.currentFunction.startsWith('I2C') && (
                      <div className="flex items-start gap-2">
                        <Radio className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>I2C 两线制接口，用于传感器和 EEPROM</span>
                      </div>
                    )}
                    {selectedPin.currentFunction === 'PWM' && (
                      <div className="flex items-start gap-2">
                        <Usb className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>PWM 脉冲调制输出，用于电机控制</span>
                      </div>
                    )}
                    {selectedPin.currentFunction === 'ADC' && (
                      <div className="flex items-start gap-2">
                        <Monitor className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>ADC 模拟输入，用于电压采集</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">此引脚为固定功能</p>
                  <p className="text-xs mt-1">无法配置</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <MousePointer2 className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-sm">点击左侧引脚进行配置</p>
              <div className="mt-6 space-y-2 text-xs">
                <div className="flex justify-between gap-8">
                  <span className="text-muted-foreground">已配置引脚:</span>
                  <span className="font-medium">{stats.used} / {stats.total}</span>
                </div>
                {Object.entries(stats.byFunction)
                  .filter(([func, count]) => func !== 'GPIO' && func !== 'POWER' && func !== 'GND' && func !== 'RESET' && count > 0)
                  .map(([func, count]) => (
                    <div key={func} className="flex justify-between gap-8">
                      <span className="text-muted-foreground">{functionLabels[func as PinFunction]}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* 生成的代码预览 */}
        {showGeneratedCode && (
          <div className="w-[500px] border-l border-border bg-muted/5 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center gap-2">
                <Settings className="w-4 h-4" />
                生成的配置代码
              </h4>
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 px-2 py-1 text-xs rounded border border-border hover:bg-muted transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? '已复制' : '复制'}
              </button>
            </div>
            <pre className="flex-1 text-xs bg-muted p-3 rounded-lg overflow-auto font-mono">
              {generateCode()}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
