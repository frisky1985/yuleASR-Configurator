import type { ReactNode } from 'react';

interface ImageMarqueeProps {
  children: ReactNode;
  speed?: number; // seconds for one loop
  pauseOnHover?: boolean;
}

export function ImageMarquee({ children, speed = 20, pauseOnHover = true }: ImageMarqueeProps) {
  return (
    <div className={`overflow-hidden ${pauseOnHover ? 'group' : ''}`}>
      <div
        className="flex gap-3 w-max animate-marquee"
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {children}
        {children}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
        .group:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

/* Mock screenshots using pure CSS */

export function MockCodeEditor() {
  return (
    <div className="w-52 h-28 rounded-lg bg-[#1e1e2e] border border-border/30 p-2.5 shrink-0 overflow-hidden">
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-2 h-2 rounded-full bg-red-400" />
        <div className="w-2 h-2 rounded-full bg-amber-400" />
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-[8px] text-gray-400 ml-1">CanIf.c</span>
      </div>
      <div className="space-y-1">
        <div className="text-[7px] font-mono"><span className="text-purple-400">void</span> <span className="text-blue-400">CanIf_Init</span>() {'{'}</div>
        <div className="text-[7px] font-mono pl-2"><span className="text-gray-500">/* Init CAN interface */</span></div>
        <div className="text-[7px] font-mono pl-2"><span className="text-purple-400">for</span> (<span className="text-purple-400">uint8</span> i = <span className="text-amber-400">0</span>; ...)</div>
        <div className="text-[7px] font-mono pl-4">ctrl[i].state = <span className="text-emerald-400">BUS_OFF</span>;</div>
        <div className="text-[7px] font-mono">{'}'}</div>
      </div>
    </div>
  );
}

export function MockGithubRepo() {
  return (
    <div className="w-52 h-28 rounded-lg bg-card border border-border p-2.5 shrink-0 overflow-hidden">
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-foreground/20" />
        </div>
        <span className="text-[9px] font-semibold truncate">frisky1985/yuletech-mcu</span>
      </div>
      <div className="text-[8px] text-muted-foreground mb-2 line-clamp-2">AutoSAR Mcu driver</div>
      <div className="flex items-center gap-3 text-[8px] text-muted-foreground">
        <span className="flex items-center gap-0.5">★ 48</span>
        <span className="flex items-center gap-0.5">⑂ 12</span>
        <span className="text-[7px] px-1 rounded-full bg-blue-500/10 text-blue-500">C</span>
      </div>
      <div className="mt-2 flex gap-1">
        <div className="h-1 rounded-full bg-blue-500 w-3/5" />
        <div className="h-1 rounded-full bg-amber-500 w-1/5" />
        <div className="h-1 rounded-full bg-muted w-1/5" />
      </div>
    </div>
  );
}

export function MockArchDiagram() {
  return (
    <div className="w-52 h-28 rounded-lg bg-card border border-border p-2.5 shrink-0 overflow-hidden flex flex-col justify-center">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-4 flex-1 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <span className="text-[7px] text-emerald-500">RTE + ASW</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 flex-1 rounded bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
            <span className="text-[7px] text-teal-500">Service</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 flex-1 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <span className="text-[7px] text-cyan-500">ECUAL</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 flex-1 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <span className="text-[7px] text-blue-500">MCAL</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MockConfigTool() {
  return (
    <div className="w-52 h-28 rounded-lg bg-card border border-border p-2.5 shrink-0 overflow-hidden">
      <div className="text-[8px] font-semibold mb-2">BSW Configurator</div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[7px] text-muted-foreground">Can Controller</span>
          <div className="w-12 h-3 rounded bg-muted border border-border" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[7px] text-muted-foreground">Baudrate</span>
          <div className="w-12 h-3 rounded bg-muted border border-border" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[7px] text-muted-foreground">Mailboxes</span>
          <div className="w-12 h-3 rounded bg-muted border border-border" />
        </div>
        <div className="h-5 rounded bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 flex items-center justify-center mt-1">
          <span className="text-[7px] text-[hsl(var(--primary))]">Generate Code</span>
        </div>
      </div>
    </div>
  );
}

export function MockTerminal() {
  return (
    <div className="w-52 h-28 rounded-lg bg-[#0c0c0c] border border-border/30 p-2.5 shrink-0 overflow-hidden">
      <div className="text-[7px] font-mono text-emerald-400 mb-1">$ cmake --build build</div>
      <div className="text-[7px] font-mono text-gray-400">[ 12%] Building C object Mcal/...</div>
      <div className="text-[7px] font-mono text-gray-400">[ 45%] Building C object Ecual/...</div>
      <div className="text-[7px] font-mono text-gray-400">[ 78%] Linking C static library...</div>
      <div className="text-[7px] font-mono text-emerald-400">[100%] Build complete ✓</div>
      <div className="text-[7px] font-mono text-gray-500 mt-1">$ ./run_tests.sh</div>
      <div className="text-[7px] font-mono text-emerald-400">All 128 tests passed</div>
    </div>
  );
}

export function MockDebugger() {
  return (
    <div className="w-52 h-28 rounded-lg bg-card border border-border p-2.5 shrink-0 overflow-hidden">
      <div className="text-[8px] font-semibold mb-1.5">Trace Debugger</div>
      <div className="flex items-end gap-0.5 h-10 mb-1">
        {[40, 65, 30, 80, 55, 90, 45, 70, 35, 85, 50, 75].map((h, i) => (
          <div key={i} className="flex-1 rounded-t-sm bg-[hsl(var(--accent))]/40" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="text-[7px] text-muted-foreground flex justify-between">
        <span>CAN_ID: 0x123</span>
        <span>DLC: 8</span>
        <span>Cycle: 10ms</span>
      </div>
    </div>
  );
}

export function MockVideoPlayer() {
  return (
    <div className="w-52 h-28 rounded-lg bg-card border border-border shrink-0 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-muted to-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))]/20 flex items-center justify-center">
          <div className="w-0 h-0 border-l-[10px] border-l-[hsl(var(--primary))] border-y-[6px] border-y-transparent ml-0.5" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-5 bg-black/40 backdrop-blur-sm flex items-center px-2 gap-1.5">
        <div className="w-2 h-2 rounded-full bg-white/80" />
        <div className="flex-1 h-1 rounded-full bg-white/20">
          <div className="w-2/3 h-full rounded-full bg-[hsl(var(--primary))]" />
        </div>
        <span className="text-[7px] text-white/80">12:34</span>
      </div>
      <div className="absolute top-1.5 left-1.5 text-[7px] px-1.5 py-0.5 rounded bg-black/40 text-white/80">
        MCAL 驱动开发
      </div>
    </div>
  );
}

export function MockCourseList() {
  return (
    <div className="w-52 h-28 rounded-lg bg-card border border-border p-2.5 shrink-0 overflow-hidden">
      <div className="text-[8px] font-semibold mb-2">学习路径</div>
      <div className="space-y-1.5">
        {[
          { name: 'AutoSAR 规范解读', progress: 100 },
          { name: 'MCAL 配置实战', progress: 75 },
          { name: '通信栈调试技巧', progress: 30 },
        ].map((c) => (
          <div key={c.name}>
            <div className="flex justify-between text-[7px] mb-0.5">
              <span className="text-muted-foreground">{c.name}</span>
              <span className="text-[hsl(var(--accent))]">{c.progress}%</span>
            </div>
            <div className="h-1 rounded-full bg-muted">
              <div className="h-full rounded-full bg-[hsl(var(--accent))]" style={{ width: `${c.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MockDocPage() {
  return (
    <div className="w-52 h-28 rounded-lg bg-card border border-border p-2.5 shrink-0 overflow-hidden">
      <div className="text-[9px] font-semibold mb-1.5">PduR 路由配置指南</div>
      <div className="space-y-1">
        <div className="h-1.5 rounded bg-muted w-full" />
        <div className="h-1.5 rounded bg-muted w-5/6" />
        <div className="h-1.5 rounded bg-muted w-4/6" />
      </div>
      <div className="mt-2 p-1.5 rounded bg-muted/50 border border-border/50">
        <div className="text-[7px] font-mono text-[hsl(var(--accent))]">PduR_RoutingPaths {'{'}</div>
        <div className="text-[7px] font-mono text-muted-foreground pl-2">CanIf --&gt; Com</div>
        <div className="text-[7px] font-mono text-muted-foreground pl-2">Com --&gt; CanIf</div>
        <div className="text-[7px] font-mono text-muted-foreground">{'}'}</div>
      </div>
    </div>
  );
}

export function MockBoardPhoto() {
  return (
    <div className="w-52 h-28 rounded-lg bg-card border border-border shrink-0 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900">
        {/* PCB traces */}
        <div className="absolute top-4 left-4 w-20 h-14 rounded border-2 border-emerald-500/30" />
        <div className="absolute top-6 left-6 w-16 h-10 rounded border border-emerald-500/20" />
        <div className="absolute top-8 right-6 w-8 h-8 rounded-full border-2 border-amber-500/30" />
        <div className="absolute bottom-4 left-8 w-12 h-0.5 bg-emerald-500/20" />
        <div className="absolute bottom-6 left-8 w-12 h-0.5 bg-emerald-500/20" />
        <div className="absolute bottom-8 left-8 w-12 h-0.5 bg-emerald-500/20" />
        {/* Chip */}
        <div className="absolute top-5 left-7 w-10 h-8 bg-slate-700 rounded-sm flex items-center justify-center">
          <span className="text-[6px] text-slate-400">i.MX8M</span>
        </div>
        {/* Pins */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute w-1 h-2 bg-amber-500/40 rounded-sm" style={{ top: 4 + i * 3, left: 2 }} />
        ))}
      </div>
      <div className="absolute bottom-1.5 left-1.5 text-[7px] px-1.5 py-0.5 rounded bg-black/50 text-white/80">
        YuleTech i.MX8M
      </div>
    </div>
  );
}

export function MockPinout() {
  return (
    <div className="w-52 h-28 rounded-lg bg-card border border-border p-2.5 shrink-0 overflow-hidden">
      <div className="text-[8px] font-semibold mb-1.5">Pinout (GPIO1)</div>
      <div className="grid grid-cols-8 gap-1">
        {[...Array(32)].map((_, i) => (
          <div key={i} className="aspect-square rounded-sm bg-muted border border-border flex items-center justify-center">
            <span className="text-[5px] text-muted-foreground">{i}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-1 mt-1">
        <span className="text-[6px] px-1 rounded bg-blue-500/10 text-blue-500">CAN</span>
        <span className="text-[6px] px-1 rounded bg-amber-500/10 text-amber-500">SPI</span>
        <span className="text-[6px] px-1 rounded bg-purple-500/10 text-purple-500">UART</span>
        <span className="text-[6px] px-1 rounded bg-emerald-500/10 text-emerald-500">PWM</span>
      </div>
    </div>
  );
}

export function MockSpecTable() {
  return (
    <div className="w-52 h-28 rounded-lg bg-card border border-border p-2.5 shrink-0 overflow-hidden">
      <div className="text-[8px] font-semibold mb-1.5">开发板规格</div>
      <div className="space-y-1">
        {[
          { label: '处理器', value: 'ARM Cortex-A53' },
          { label: '核心', value: '4x A53 + M4' },
          { label: '内存', value: '2GB LPDDR4' },
          { label: '存储', value: '16GB eMMC' },
          { label: '接口', value: 'CAN-FD x2, ETH' },
        ].map((row) => (
          <div key={row.label} className="flex justify-between text-[7px]">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-medium">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
