import { useRef, useEffect, useMemo } from 'react';
import { Activity } from 'lucide-react';

export interface GpioEvent {
  pin: number;
  timestamp: number;
  level: number;
}

interface GpioWaveformProps {
  events: GpioEvent[];
  pins?: number[];
  timeWindow?: number;
}

const PIN_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
  '#6366f1', '#84cc16', '#06b6d4', '#d946ef',
  '#0ea5e9', '#22c55e', '#eab308', '#a855f7',
];

export function GpioWaveform({ events, pins = [0, 1, 2, 3], timeWindow = 1000 }: GpioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pinEvents = useMemo(() => {
    const now = Date.now();
    const recentEvents = events.filter(e => (now - e.timestamp) < timeWindow);
    const map = new Map<number, GpioEvent[]>();
    for (const pin of pins) {
      const pinEvts = recentEvents
        .filter(e => e.pin === pin)
        .sort((a, b) => a.timestamp - b.timestamp);
      map.set(pin, pinEvts);
    }
    return map;
  }, [events, pins, timeWindow]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const rowHeight = height / pins.length;
    const padding = { left: 40, right: 16, top: 8, bottom: 8 };
    const plotWidth = width - padding.left - padding.right;
    const now = Date.now();

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.15)';
    ctx.lineWidth = 0.5;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const x = padding.left + (plotWidth / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw each pin waveform
    pins.forEach((pin, idx) => {
      const y = idx * rowHeight;
      const midY = y + rowHeight / 2;

      // Pin label
      ctx.fillStyle = PIN_COLORS[pin % PIN_COLORS.length];
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`GPIO${pin}`, padding.left - 6, midY + 3);

      // Baseline
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(padding.left, midY);
      ctx.lineTo(width - padding.right, midY);
      ctx.stroke();

      // Draw waveform
      const pinEvts = pinEvents.get(pin) || [];
      ctx.strokeStyle = PIN_COLORS[pin % PIN_COLORS.length];
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      if (pinEvts.length === 0) {
        // Just draw a low line
        ctx.moveTo(padding.left, y + rowHeight - padding.bottom);
        ctx.lineTo(width - padding.right, y + rowHeight - padding.bottom);
        ctx.stroke();
        return;
      }

      const firstEvent = pinEvts[0];
      let currentLevel = firstEvent.level;
      const x0 = padding.left;
      const yHigh = y + padding.top + 2;
      const yLow = y + rowHeight - padding.bottom - 2;

      ctx.moveTo(x0, currentLevel ? yHigh : yLow);

      for (const evt of pinEvts) {
        const x = padding.left + (1 - (now - evt.timestamp) / timeWindow) * plotWidth;
        const yVal = evt.level ? yHigh : yLow;

        if (x < padding.left) continue;
        if (x > width - padding.right) break;

        ctx.lineTo(x, yVal);
        currentLevel = evt.level;
      }

      // Extend to end
      ctx.lineTo(width - padding.right, currentLevel ? yHigh : yLow);
      ctx.stroke();

      // Level indicators
      ctx.fillStyle = 'rgba(100, 116, 139, 0.5)';
      ctx.font = '8px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('1', padding.left + 2, y + padding.top + 8);
      ctx.fillText('0', padding.left + 2, y + rowHeight - padding.bottom - 2);
    });

    // Time axis
    ctx.fillStyle = 'rgba(100, 116, 139, 0.6)';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i <= gridLines; i++) {
      const x = padding.left + (plotWidth / gridLines) * i;
      const timeLabel = `${((timeWindow / gridLines) * (gridLines - i) / 1000).toFixed(1)}s`;
      ctx.fillText(timeLabel, x, height - 1);
    }
  }, [pinEvents, pins, timeWindow]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
        <Activity className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">GPIO Waveform</span>
        <span className="text-[10px] text-muted-foreground ml-auto">
          {timeWindow / 1000}s window
        </span>
      </div>
      <div className="p-2">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ height: `${pins.length * 48}px`, minHeight: '120px' }}
        />
      </div>
    </div>
  );
}
