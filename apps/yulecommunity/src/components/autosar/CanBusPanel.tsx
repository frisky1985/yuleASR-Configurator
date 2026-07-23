import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, Search, X } from 'lucide-react';

export interface CanMessage {
  id: number;
  dlc: number;
  data: number[];
  timestamp: number;
  direction: 'tx' | 'rx';
}

interface CanBusPanelProps {
  messages: CanMessage[];
  maxMessages?: number;
}

export function CanBusPanel({ messages, maxMessages = 100 }: CanBusPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [isRunning, setIsRunning] = useState(true);

  const filteredMessages = filter
    ? messages.filter(m =>
        m.id.toString(16).includes(filter.toLowerCase()) ||
        m.data.map(b => b.toString(16).padStart(2, '0')).join(' ').includes(filter.toLowerCase())
      )
    : messages;

  const displayedMessages = filteredMessages.slice(-maxMessages);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedMessages.length, autoScroll]);

  /* Parent controls the actual clear */

  const formatHex = (val: number, pad: number = 2) =>
    val.toString(16).toUpperCase().padStart(pad, '0');

  const canIdColor = (id: number) => {
    if (id < 0x100) return 'text-green-500';
    if (id < 0x200) return 'text-blue-500';
    if (id < 0x400) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">CAN Bus Monitor</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
            {messages.length} msgs
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-1 text-[10px] rounded-md border transition-colors ${
              autoScroll
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'border-border text-muted-foreground'
            }`}
          >
            Auto
          </button>
          {/* Start/Stop */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-2 py-1 text-[10px] rounded-md border transition-colors ${
              isRunning
                ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400'
                : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
            }`}
          >
            {isRunning ? 'Running' : 'Paused'}
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="px-4 py-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter by ID or data (hex)..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-background border border-border focus:outline-none focus:border-primary/50"
          />
          {filter && (
            <button
              onClick={() => setFilter('')}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Message List */}
      <div
        ref={containerRef}
        className="overflow-y-auto"
        style={{ maxHeight: '320px' }}
      >
        {displayedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Radio className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-xs">No CAN messages</p>
            <p className="text-[10px] opacity-60">Run your code to see bus activity</p>
          </div>
        ) : (
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left px-3 py-1.5 text-[10px] text-muted-foreground font-medium">Time</th>
                <th className="text-left px-3 py-1.5 text-[10px] text-muted-foreground font-medium">Dir</th>
                <th className="text-left px-3 py-1.5 text-[10px] text-muted-foreground font-medium">ID</th>
                <th className="text-left px-3 py-1.5 text-[10px] text-muted-foreground font-medium">DLC</th>
                <th className="text-left px-3 py-1.5 text-[10px] text-muted-foreground font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {displayedMessages.map((msg, i) => (
                <motion.tr
                  key={`${msg.timestamp}-${msg.id}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-3 py-1.5 text-muted-foreground text-[10px]">
                    {msg.timestamp.toFixed(1)}ms
                  </td>
                  <td className="px-3 py-1.5">
                    <span className={`text-[10px] font-medium ${msg.direction === 'tx' ? 'text-blue-500' : 'text-green-500'}`}>
                      {msg.direction === 'tx' ? 'TX' : 'RX'}
                    </span>
                  </td>
                  <td className={`px-3 py-1.5 font-semibold ${canIdColor(msg.id)}`}>
                    0x{formatHex(msg.id, 3)}
                  </td>
                  <td className="px-3 py-1.5 text-muted-foreground">
                    {msg.dlc}
                  </td>
                  <td className="px-3 py-1.5">
                    <div className="flex gap-0.5">
                      {msg.data.slice(0, msg.dlc).map((byte, j) => (
                        <span
                          key={j}
                          className={`inline-block px-1 rounded ${
                            byte === 0
                              ? 'text-muted-foreground/50'
                              : 'text-foreground'
                          }`}
                        >
                          {formatHex(byte)}
                        </span>
                      ))}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
