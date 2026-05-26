import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Terminal, 
  X, 
  ChevronRight, 
  Home, 
  Code, 
  BookOpen, 
  Users, 
  Moon,
  Sun,
  Command,
  Copy,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

// 命令定义
interface CLICommand {
  name: string;
  aliases?: string[];
  description: string;
  usage: string;
  action: (args: string[]) => string | void;
  category: 'navigation' | 'theme' | 'tools' | 'system';
}

// 命令历史
interface CommandHistory {
  command: string;
  output: string;
  timestamp: Date;
  isError?: boolean;
}

export function InteractiveCLI() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // 定义命令
  const commands: CLICommand[] = [
    // 导航命令
    {
      name: 'goto',
      aliases: ['cd', 'nav'],
      description: '导航到指定页面',
      usage: 'goto <page>',
      category: 'navigation',
      action: (args) => {
        const page = args[0]?.toLowerCase();
        const routes: Record<string, string> = {
          'home': '/',
          'index': '/',
          'opensource': '/opensource',
          'code': '/opensource',
          'toolchain': '/toolchain',
          'tools': '/toolchain',
          'learning': '/learning',
          'learn': '/learning',
          'blog': '/blog',
          'docs': '/docs',
          'documents': '/docs',
          'forum': '/forum',
          'community': '/forum',
          'qa': '/qa',
          'questions': '/qa',
          'events': '/events',
          'hardware': '/hardware',
          'board': '/hardware',
          'profile': '/profile',
          'admin': '/admin/dashboard'
        };
        
        if (page && routes[page]) {
          navigate(routes[page]);
          setIsOpen(false);
          return `✓ 正在导航到 ${page}...`;
        }
        return `❌ 未知页面: ${page || '(empty)'}. 可用页面: home, opensource, toolchain, learning, blog, docs, forum, qa, events, hardware`;
      }
    },
    {
      name: 'open',
      aliases: ['o'],
      description: '在新标签页打开链接',
      usage: 'open <url>',
      category: 'navigation',
      action: (args) => {
        const url = args[0];
        if (!url) return '❌ 请指定 URL';
        window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
        return `✓ 已在新标签页打开: ${url}`;
      }
    },
    
    // 主题命令
    {
      name: 'theme',
      aliases: ['t'],
      description: '切换或设置主题',
      usage: 'theme [dark|light]',
      category: 'theme',
      action: (args) => {
        const mode = args[0]?.toLowerCase();
        if (mode === 'dark' || mode === 'light') {
          if ((mode === 'dark') !== (theme === 'dark')) {
            toggleTheme();
          }
          return `✓ 主题已设置为 ${mode}`;
        }
        toggleTheme();
        return `✓ 主题已切换为 ${theme === 'dark' ? 'light' : 'dark'}`;
      }
    },
    {
      name: 'dark',
      description: '切换到深色模式',
      usage: 'dark',
      category: 'theme',
      action: () => {
        if (theme !== 'dark') toggleTheme();
        return '✓ 已切换到深色模式';
      }
    },
    {
      name: 'light',
      description: '切换到浅色模式',
      usage: 'light',
      category: 'theme',
      action: () => {
        if (theme !== 'light') toggleTheme();
        return '✓ 已切换到浅色模式';
      }
    },
    
    // 工具命令
    {
      name: 'search',
      aliases: ['s', 'find'],
      description: '搜索代码或内容',
      usage: 'search <query>',
      category: 'tools',
      action: (args) => {
        const query = args.join(' ');
        if (!query) return '❌ 请输入搜索关键词';
        // 触发代码搜索事件
        const event = new CustomEvent('yule:openCodeSearch', { detail: { query } });
        window.dispatchEvent(event);
        setIsOpen(false);
        return `✓ 正在搜索: "${query}"`;
      }
    },
    {
      name: 'github',
      aliases: ['gh', 'repo'],
      description: '打开 GitHub 代码仓库',
      usage: 'github',
      category: 'tools',
      action: () => {
        window.open('https://github.com/frisky1985/yuleCommunity', '_blank');
        return '✓ 已打开 GitHub 仓库';
      }
    },
    {
      name: 'docs',
      description: '打开文档中心',
      usage: 'docs',
      category: 'tools',
      action: () => {
        navigate('/docs');
        setIsOpen(false);
        return '✓ 正在打开文档中心...';
      }
    },
    
    // 系统命令
    {
      name: 'help',
      aliases: ['h', '?'],
      description: '显示帮助信息',
      usage: 'help [command]',
      category: 'system',
      action: (args) => {
        if (args[0]) {
          const cmd = commands.find(c => 
            c.name === args[0] || c.aliases?.includes(args[0])
          );
          if (cmd) {
            return `${cmd.name}: ${cmd.description}\n用法: ${cmd.usage}`;
          }
          return `❌ 未知命令: ${args[0]}`;
        }
        
        let output = '📚 可用命令\n\n';
        const categories = ['navigation', 'theme', 'tools', 'system'];
        const categoryNames: Record<string, string> = {
          navigation: '📁 导航',
          theme: '🎨 主题',
          tools: '🔧 工具',
          system: '⚙️ 系统'
        };
        
        categories.forEach(cat => {
          const catCommands = commands.filter(c => c.category === cat);
          if (catCommands.length > 0) {
            output += `${categoryNames[cat]}:\n`;
            catCommands.forEach(cmd => {
              const aliases = cmd.aliases ? ` (${cmd.aliases.join(', ')})` : '';
              output += `  ${cmd.name}${aliases.padEnd(12)} - ${cmd.description}\n`;
            });
            output += '\n';
          }
        });
        
        output += '提示:\n';
        output += '  • 使用 Tab 键补全命令\n';
        output += '  • 使用 ↑↓ 键浏览历史\n';
        output += '  • 输入 "clear" 清屏\n';
        return output;
      }
    },
    {
      name: 'clear',
      aliases: ['cls'],
      description: '清除终端屏幕',
      usage: 'clear',
      category: 'system',
      action: () => {
        setHistory([]);
        return '';
      }
    },
    {
      name: 'echo',
      description: '输出文本',
      usage: 'echo <text>',
      category: 'system',
      action: (args) => args.join(' ') || ''
    },
    {
      name: 'date',
      description: '显示当前日期和时间',
      usage: 'date',
      category: 'system',
      action: () => {
        const now = new Date();
        return now.toLocaleString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          weekday: 'long'
        });
      }
    },
    {
      name: 'version',
      aliases: ['v', 'ver'],
      description: '显示版本信息',
      usage: 'version',
      category: 'system',
      action: () => `YuleTech CLI v0.7.5\nBuild: ${new Date().toISOString().split('T')[0]}\n版本历史: v0.7.0 - v0.7.5`
    },
    {
      name: 'exit',
      aliases: ['quit', 'q'],
      description: '关闭终端',
      usage: 'exit',
      category: 'system',
      action: () => {
        setIsOpen(false);
        return '';
      }
    }
  ];

  // 执行命令
  const executeCommand = useCallback((cmdLine: string) => {
    const trimmed = cmdLine.trim();
    if (!trimmed) return;

    const parts = trimmed.split(/\s+/);
    const cmdName = parts[0].toLowerCase();
    const args = parts.slice(1);

    const command = commands.find(c => 
      c.name === cmdName || c.aliases?.includes(cmdName)
    );

    let output: string;
    let isError = false;

    if (command) {
      try {
        const result = command.action(args);
        output = result || '';
      } catch (e) {
        output = `❌ 命令执行出错: ${e}`;
        isError = true;
      }
    } else {
      output = `❌ 未知命令: "${cmdName}". 输入 "help" 查看可用命令`;
      isError = true;
    }

    setHistory(prev => [...prev, {
      command: trimmed,
      output,
      timestamp: new Date(),
      isError
    }]);
    setHistoryIndex(-1);
  }, [commands, navigate, theme, toggleTheme]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Shift + K 打开终端
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // ESC 关闭
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // 聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 自动滚动到底部
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // 处理键盘输入
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex].command);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex].command);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // 命令补全
      const partial = input.toLowerCase();
      const matches = commands.filter(c => 
        c.name.startsWith(partial) || c.aliases?.some(a => a.startsWith(partial))
      );
      if (matches.length === 1) {
        setInput(matches[0].name + ' ');
      }
    }
  };

  // 复制历史记录
  const copyHistory = () => {
    const text = history.map(h => `> ${h.command}\n${h.output}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border shadow-lg hover:shadow-xl transition-all hover:scale-105"
        title="打开命令行 (Cmd+Shift+K)"
      >
        <Terminal className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">命令行</span>
        <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">
          ⌘⇧K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6 pointer-events-none">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/20 pointer-events-auto"
        onClick={() => setIsOpen(false)}
      />
      
      {/* 终端窗口 */}
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-4 duration-200">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Terminal className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">YuleTech CLI</h3>
              <p className="text-[10px] text-muted-foreground">输入 "help" 查看可用命令</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyHistory}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="复制历史记录"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 命令历史区域 */}
        <div 
          ref={terminalRef}
          className="h-80 overflow-y-auto p-4 font-mono text-sm space-y-3 bg-black/5"
        >
          {/* 欢迎信息 */}
          {history.length === 0 && (
            <div className="text-muted-foreground space-y-1">
              <div className="flex items-center gap-2 text-primary">
                <Command className="w-4 h-4" />
                <span className="font-semibold">欢迎使用 YuleTech CLI</span>
              </div>
              <div className="text-xs opacity-70 pl-6">
                <div>版本: v0.7.5</div>
                <div>快捷键: Cmd+Shift+K 打开 | ESC 关闭 | Tab 补全 | ↑↓ 历史</div>
                <div className="mt-2">试试输入: <span className="text-primary">goto opensource</span> 或 <span className="text-primary">help</span></div>
              </div>
            </div>
          )}

          {/* 历史记录 */}
          {history.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="font-medium">{item.command}</span>
              </div>
              {item.output && (
                <div className={`pl-6 whitespace-pre-wrap ${item.isError ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {item.output}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 输入框 */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-border bg-card">
          <ChevronRight className="w-4 h-4 text-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入命令..."
            className="flex-1 bg-transparent outline-none text-sm font-mono"
            spellCheck={false}
            autoComplete="off"
          />
          <kbd className="hidden sm:block text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
            ENTER
          </kbd>
        </div>

        {/* 快捷命令 */}
        <div className="flex items-center gap-2 px-4 py-2 border-t border-border bg-muted/20 overflow-x-auto">
          {[
            { cmd: 'goto home', icon: Home, label: '首页' },
            { cmd: 'goto opensource', icon: Code, label: '代码' },
            { cmd: 'goto learning', icon: BookOpen, label: '学习' },
            { cmd: 'goto forum', icon: Users, label: '论坛' },
            { cmd: 'theme', icon: theme === 'dark' ? Sun : Moon, label: '切换主题' },
          ].map(({ cmd, icon: Icon, label }) => (
            <button
              key={cmd}
              onClick={() => {
                executeCommand(cmd);
                if (!cmd.startsWith('theme')) {
                  setIsOpen(false);
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors text-xs whitespace-nowrap"
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
