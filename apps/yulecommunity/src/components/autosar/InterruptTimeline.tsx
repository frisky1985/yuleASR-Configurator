import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export interface InterruptEvent {
  source: string;
  timestamp: number;
  priority: number;
  description: string;
}

interface InterruptTimelineProps {
  events: InterruptEvent[];
  maxEvents?: number;
  timeWindow?: number;
}

const SOURCE_COLORS: Record<string, string> = {
  CAN: 'bg-blue-500',
  DIO: 'bg-green-500',
  SPI: 'bg-amber-500',
  MCU: 'bg-red-500',
  TIMER: 'bg-purple-500',
  UART: 'bg-pink-500',
  DEFAULT: 'bg-slate-500',
};

export function InterruptTimeline({ events, maxEvents = 50, timeWindow = 2000 }: InterruptTimelineProps) {
  const recentEvents = useMemo(() => {
    const now = Date.now();
    return events
      .filter(e => (now - e.timestamp) < timeWindow)
      .slice(-maxEvents)
      .reverse();
  }, [events, maxEvents, timeWindow]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const evt of events) {
      counts[evt.source] = (counts[evt.source] || 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [events]);

  if (recentEvents.length === 0 && stats.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Interrupt Timeline</span>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Zap className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-xs">No interrupts triggered</p>
          <p className="text-[10px] opacity-60">Run code to see interrupt activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Interrupt Timeline</span>
        <span className="text-[10px] text-muted-foreground ml-auto">
          {recentEvents.length} in {timeWindow / 1000}s
        </span>
      </div>

      {/* Statistics */}
      {stats.length > 0 && (
        <div className="px-4 py-2 border-b border-border bg-muted/10">
          <div className="flex flex-wrap gap-2">
            {stats.map(([source, count]) => (
              <span
                key={source}
                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted border border-border"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${SOURCE_COLORS[source] || SOURCE_COLORS.DEFAULT}`} />
                {source}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="px-4 py-3 max-h-[280px] overflow-y-auto">
        <div className="relative">
          {/* Time axis */}
          <div className="absolute left-0 right-0 top-0 h-px bg-border/30" />

          {recentEvents.map((evt, i) => (
            <motion.div
              key={`${evt.timestamp}-${evt.source}-${i}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.02 }}
              className="flex items-start gap-3 py-1.5 relative"
            >
              {/* Timeline dot and line */}
              <div className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full ${SOURCE_COLORS[evt.source] || SOURCE_COLORS.DEFAULT} shadow-sm`} />
                {i < recentEvents.length - 1 && (
                  <div className="w-px flex-1 bg-border/20 mt-0.5" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    SOURCE_COLORS[evt.source]
                      ? `bg-${SOURCE_COLORS[evt.source].replace('bg-', '')}/10 text-${SOURCE_COLORS[evt.source].replace('bg-', '')}`
                      : 'bg-slate-500/10 text-slate-500'
                  }`}>
                    {evt.source}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    ({evt.timestamp.toFixed(1)}ms)
                  </span>
                  <span className="text-[9px] text-muted-foreground/60 ml-auto">
                    prio {evt.priority}
                  </span>
                </div>
                <p className="text-[11px] text-foreground/80 mt-0.5 truncate">
                  {evt.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
