import { Helmet } from 'react-helmet-async';
import {
  Cpu,
  MemoryStick,
  Wifi,
  Usb,
  HardDrive,
  Zap,
  BookOpen,
  ExternalLink,
  ShoppingCart,
  Wrench,
  Microchip,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { PinConfigurator } from '../components/PinConfigurator';

const specs = [
  { label: '处理器', value: 'ARM Cortex-A53 Quad Core', icon: Cpu },
  { label: 'CPU 架构', value: 'ARM Cortex-A53 @ 1.8GHz × 4', icon: Microchip },
  { label: '内存', value: '2GB LPDDR4', icon: MemoryStick },
  { label: '存储', value: '16GB eMMC + microSD 扩展', icon: HardDrive },
  { label: '网络', value: '千兆以太网 + Wi-Fi / 蓝牙', icon: Wifi },
  { label: 'USB', value: 'USB 2.0 OTG + USB 2.0 Host', icon: Usb },
  { label: '电源', value: '5V/3A USB-C', icon: Zap },
  { label: '尺寸', value: '85mm × 56mm', icon: Layers },
];

const tutorials = [
  { title: '开发板快速入门指南', desc: '从开箱到点亮第一个 LED 的完整教程', link: '#' },
  { title: 'MCAL 驱动移植教程', desc: '基于 YuleTech BSW 的 MCAL 层移植实战', link: '#' },
  { title: 'Linux BSP 构建指南', desc: '使用 Yocto 构建定制化 Linux 镜像', link: '#' },
  { title: 'AutoSAR OS 配置与启动', desc: '配置并启动 FreeRTOS 映射', link: '#' },
];

export function HardwarePage() {
  return (
    <div className="min-h-screen pt-16">
      <Helmet>
        <title>开发板 - YuleTech | 硬件平台</title>
        <meta name="description" content="专为 AutoSAR BSW 开发优化的开发板，预装 YuleTech 开源基础软件栈，提供从驱动开发到系统集成的完整硬件支持。" />
      </Helmet>
      {/* Hero */}
      <section className="relative py-16 overflow-hidden bg-gradient-to-b from-[hsl(var(--primary))]/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-sm font-medium mb-6">
              <Cpu className="w-4 h-4" />
              软硬件一体开源方案
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              YuleTech
              <span className="text-gradient-accent"> 开发板</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              专为 AutoSAR BSW 开发优化的开发板，预装 YuleTech 开源基础软件栈，
              提供从驱动开发到系统集成的完整硬件支持。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(var(--primary))] text-primary-foreground rounded-xl font-semibold hover:bg-[hsl(var(--primary-glow))] transition-colors">
                <ShoppingCart className="w-4 h-4" />
                立即购买
              </button>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-colors border border-border">
                <Wrench className="w-4 h-4" />
                申请试用
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Board Preview + Specs */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Board Image Placeholder */}
            <Card className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-muted via-background to-muted flex items-center justify-center">
                <div className="text-center">
                  <Cpu className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">开发板预览</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">实际产品图片将在后续更新</p>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-[hsl(var(--accent))]">4×A53</div>
                    <div className="text-xs text-muted-foreground">Cortex-A53</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-[hsl(var(--accent))]">2GB</div>
                    <div className="text-xs text-muted-foreground">LPDDR4</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-[hsl(var(--accent))]">16GB</div>
                    <div className="text-xs text-muted-foreground">eMMC</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-[hsl(var(--accent))]">1.8GHz</div>
                    <div className="text-xs text-muted-foreground">主频</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specs Table */}
            <Card>
              <CardHeader>
                <CardTitle>规格参数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  {specs.map((spec) => (
                    <div key={spec.label} className="flex items-center gap-3 py-3">
                      <spec.icon className="w-4 h-4 text-[hsl(var(--accent))]" />
                      <span className="text-sm text-muted-foreground w-24">{spec.label}</span>
                      <span className="text-sm font-medium flex-1">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tutorials */}
      <section className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[hsl(var(--accent))]" />
            使用教程
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tutorials.map((t) => (
              <Card key={t.title} className="hover:border-[hsl(var(--accent))]/30 transition-all cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold group-hover:text-[hsl(var(--accent))] transition-colors">{t.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pin Configurator */}
      <section className="py-12 border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-3 flex items-center justify-center gap-2">
              <Layers className="w-6 h-6 text-[hsl(var(--accent))]" />
              引脚配置工具
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              可视化配置开发板引脚功能，支持 GPIO、CAN、SPI、UART、I2C、PWM、ADC 等多种功能映射，
              一键生成符合 AutoSAR 标准的 Port 配置代码。
            </p>
          </div>
          <PinConfigurator />
        </div>
      </section>

      {/* Schematic Preview */}
      <section className="py-12 border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6">原理图预览</h2>
          <Card className="overflow-hidden">
            <div className="aspect-[16/9] bg-gradient-to-br from-muted via-background to-muted flex items-center justify-center">
              <div className="text-center">
                <Layers className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">原理图预览区域</p>
                <p className="text-xs text-muted-foreground/60 mt-1">点击下载完整 PDF 原理图</p>
                <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-primary-foreground rounded-lg text-sm font-medium hover:bg-[hsl(var(--primary-glow))] transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  下载原理图
                </button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
