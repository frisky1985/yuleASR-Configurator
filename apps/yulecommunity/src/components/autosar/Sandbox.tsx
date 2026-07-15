import { useCallback, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { Play, Square, Trash2, FileCode, AlertCircle, CheckCircle, Terminal, Loader2 } from 'lucide-react';
import { SANDBOX_EXAMPLES, getExampleById } from '../../data/autosar/sandbox-examples';
import { simulateCode } from '../../data/autosar/simulation-engine';
import { VIRTUAL_HEADERS } from '../../data/autosar-headers';
import type { CanMessage } from './CanBusPanel';
import type { GpioEvent } from './GpioWaveform';
import type { InterruptEvent } from './InterruptTimeline';

interface SandboxProps {
  onCanMessages?: (msgs: CanMessage[]) => void;
  onGpioEvents?: (events: GpioEvent[]) => void;
  onInterrupts?: (events: InterruptEvent[]) => void;
  initialExampleId?: string;
}

export function Sandbox({ onCanMessages, onGpioEvents, onInterrupts, initialExampleId }: SandboxProps) {
  const initialExample = initialExampleId ? (getExampleById(initialExampleId) ?? SANDBOX_EXAMPLES[0]) : SANDBOX_EXAMPLES[0];
  const [code, setCode] = useState(initialExample.code);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedExample, setSelectedExample] = useState(initialExample.id);
  const [autoIncludeHeaders, setAutoIncludeHeaders] = useState(true);
  const [activeTab, setActiveTab] = useState<'code' | 'headers'>('code');
  const [compileStatus, setCompileStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const outputRef = useRef<HTMLDivElement>(null);

  const handleExampleChange = useCallback((exampleId: string) => {
    const example = getExampleById(exampleId);
    if (example) {
      setSelectedExample(exampleId);
      setCode(example.code);
      setOutput([]);
      setCompileStatus('idle');
    }
  }, []);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setCompileStatus('running');
    setOutput([]);

    // Simulate async compilation
    setTimeout(() => {
      const result = simulateCode(code);

      setOutput(result.output);
      setCompileStatus(result.success ? 'success' : 'error');

      if (result.success) {
        onCanMessages?.(result.state.canMessages);
        onGpioEvents?.(result.state.gpioEvents);
        onInterrupts?.(result.state.interrupts);
      }

      setIsRunning(false);

      // Auto-scroll output
      setTimeout(() => {
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
      }, 100);
    }, 300);
  }, [code, onCanMessages, onGpioEvents, onInterrupts]);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setCompileStatus('idle');
  }, []);

  const handleClear = useCallback(() => {
    setOutput([]);
    setCompileStatus('idle');
  }, []);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      setCompileStatus('idle');
    }
  }, []);

  const StatusBadge = () => {
    switch (compileStatus) {
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            Compiling...
          </span>
        );
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
            <CheckCircle className="w-3 h-3" />
            Simulation OK
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
            <AlertCircle className="w-3 h-3" />
            Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            <Terminal className="w-3 h-3" />
            Ready
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20">
        <div className="flex items-center gap-3">
          {/* Example selector */}
          <select
            value={selectedExample}
            onChange={e => handleExampleChange(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border focus:outline-none focus:border-primary/50 max-w-[200px]"
          >
            <optgroup label="Examples">
              {SANDBOX_EXAMPLES.map(ex => (
                <option key={ex.id} value={ex.id}>
                  [{ex.category}] {ex.name}
                </option>
              ))}
            </optgroup>
          </select>

          {/* Auto-include toggle */}
          <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={autoIncludeHeaders}
              onChange={e => setAutoIncludeHeaders(e.target.checked)}
              className="rounded border-border accent-primary"
            />
            Auto Headers
          </label>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge />

          {/* Clear output */}
          <button
            onClick={handleClear}
            disabled={output.length === 0}
            className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Clear output"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Run / Stop */}
          {isRunning ? (
            <button
              onClick={handleStop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
            >
              <Square className="w-3 h-3" />
              Stop
            </button>
          ) : (
            <button
              onClick={handleRun}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors"
            >
              <Play className="w-3 h-3" />
              Run
            </button>
          )}
        </div>
      </div>

      {/* Editor Tabs */}
      <div className="flex border-b border-border bg-muted/10">
        <button
          onClick={() => setActiveTab('code')}
          className={`px-4 py-1.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'code'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileCode className="w-3 h-3 inline mr-1" />
          Code
        </button>
        <button
          onClick={() => setActiveTab('headers')}
          className={`px-4 py-1.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'headers'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileCode className="w-3 h-3 inline mr-1" />
          Headers
        </button>
      </div>

      {/* Code Editor */}
      <div className="flex-1 relative overflow-hidden">
        {activeTab === 'code' ? (
          <Editor
            height="100%"
            defaultLanguage="c"
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              padding: { top: 8 },
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              tabSize: 4,
              insertSpaces: true,
              automaticLayout: true,
              wordWrap: 'on',
            }}
          />
        ) : (
          <div className="h-full overflow-y-auto p-4 bg-[#1e1e1e]">
            <h3 className="text-xs font-medium text-[#cccccc] mb-3">AutoSAR Virtual Headers</h3>
            <div className="grid gap-4">
              {VIRTUAL_HEADERS.map(hdr => (
                <details key={hdr.name} className="group">
                  <summary className="text-xs text-[#569cd6] cursor-pointer hover:text-[#75b5e8] font-mono mb-1">
                    {hdr.name}
                  </summary>
                  <pre className="text-[11px] text-[#d4d4d4] font-mono bg-[#2d2d2d] rounded-lg p-3 overflow-x-auto max-h-64 overflow-y-auto">
                    {hdr.content.split('\n').slice(0, 60).join('\n')}
                    {hdr.content.split('\n').length > 60 && (
                      <span className="text-[#6a9955]">\n... (truncated)</span>
                    )}
                  </pre>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Compile Output */}
      <motion.div
        initial={false}
        className="border-t border-border bg-[#1a1a2e]"
      >
        <div className="flex items-center justify-between px-4 py-1.5 border-b border-border/50">
          <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5">
            <Terminal className="w-3 h-3" />
            Output
          </span>
          <span className="text-[9px] text-muted-foreground/60">
            Simulation Mode
          </span>
        </div>
        <div
          ref={outputRef}
          className="overflow-y-auto font-mono text-[11px] leading-relaxed p-3"
          style={{ maxHeight: '180px', minHeight: '60px' }}
        >
          {output.length === 0 ? (
            <span className="text-muted-foreground/40">
              Click "Run" to simulate your AutoSAR code...
            </span>
          ) : (
            output.map((line, i) => {
              const isError = line.includes('[ERROR]') || line.includes('ERROR:');
              const isSim = line.startsWith('[SIM]');
              const isSummary = line.startsWith('===');

              return (
                <div
                  key={i}
                  className={`whitespace-pre-wrap ${
                    isError
                      ? 'text-red-400'
                      : isSummary
                      ? 'text-primary font-semibold'
                      : isSim
                      ? 'text-green-400'
                      : 'text-foreground/80'
                  }`}
                >
                  {line}
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}
