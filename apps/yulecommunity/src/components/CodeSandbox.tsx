import { useState, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Terminal,
  Settings,
  AlertTriangle,
  Clock,
  Download,
} from 'lucide-react';

interface SandboxOutput {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  executionTime: number;
}

const DEFAULT_CODE = `// YuleTech C Code Sandbox
// 这是一个简单的 C 语言示例
// 点击"运行"按钮查看输出

#include <stdio.h>

int main() {
    printf("Hello, YuleTech!\\n");
    printf("欢迎使用在线代码沙盒\\n");
    
    // 计算 1+2+...+10
    int sum = 0;
    for (int i = 1; i <= 10; i++) {
        sum += i;
    }
    printf("1+2+...+10 = %d\\n", sum);
    
    return 0;
}`;

const EXAMPLE_TEMPLATES = [
  {
    name: 'Hello World',
    code: DEFAULT_CODE,
  },
  {
    name: '数组操作',
    code: `#include <stdio.h>

int main() {
    int arr[] = {1, 2, 3, 4, 5};
    int n = sizeof(arr) / sizeof(arr[0]);
    
    printf("数组元素: ");
    for (int i = 0; i < n; i++) {
        printf("%d ", arr[i]);
    }
    printf("\\n");
    
    // 计算和
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum += arr[i];
    }
    printf("和: %d\\n", sum);
    
    return 0;
}`,
  },
  {
    name: '指针示例',
    code: `#include <stdio.h>

int main() {
    int value = 42;
    int *ptr = &value;
    
    printf("变量值: %d\\n", value);
    printf("变量地址: %p\\n", (void*)&value);
    printf("指针值: %p\\n", (void*)ptr);
    printf("指针所指值: %d\\n", *ptr);
    
    // 修改指针所指的值
    *ptr = 100;
    printf("修改后的值: %d\\n", value);
    
    return 0;
}`,
  },
  {
    name: '结构体示例',
    code: `#include <stdio.h>
#include <string.h>

typedef struct {
    char name[20];
    int age;
    float score;
} Student;

int main() {
    Student s1;
    strcpy(s1.name, "张三");
    s1.age = 20;
    s1.score = 85.5;
    
    printf("学生信息:\\n");
    printf("姓名: %s\\n", s1.name);
    printf("年龄: %d\\n", s1.age);
    printf("成绩: %.1f\\n", s1.score);
    
    return 0;
}`,
  },
];

export function CodeSandbox() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<SandboxOutput | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = useCallback((editor: any) => {
    editorRef.current = editor;
  }, []);

  // 模拟代码执行（实际项目中应使用 WebAssembly 或后端 API）
  const runCode = async () => {
    setIsRunning(true);
    setOutput(null);

    const startTime = performance.now();

    try {
      // 模拟执行延迟
      await new Promise(resolve => setTimeout(resolve, 800));

      // 模拟输出（实际应调用编译/执行服务）
      const mockOutput = simulateExecution(code);
      
      const executionTime = performance.now() - startTime;

      setOutput({
        stdout: mockOutput,
        stderr: '',
        exitCode: 0,
        executionTime,
      });
    } catch (error) {
      setOutput({
        stdout: '',
        stderr: String(error),
        exitCode: 1,
        executionTime: performance.now() - startTime,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // 简单的代码模拟执行
  const simulateExecution = (sourceCode: string): string => {
    // 提取 printf 语句
    const printfMatches = sourceCode.match(/printf\s*\(\s*"([^"]*)"[^)]*\)/g);
    if (!printfMatches) return '// 没有输出';

    let output = '';
    printfMatches.forEach(match => {
      // 提取格式字符串
      const formatMatch = match.match(/"((?:[^"\\]|\\.)*)"/);
      if (formatMatch) {
        let format = formatMatch[1];
        // 处理转义字符
        format = format
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\\\/g, '\\');
        output += format;
      }
    });

    return output || '// 请确保使用 printf 输出内容';
  };

  const resetCode = () => {
    if (confirm('确定要重置代码吗？')) {
      setCode(DEFAULT_CODE);
      setOutput(null);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const loadTemplate = (templateCode: string) => {
    if (code !== DEFAULT_CODE && !confirm('当前代码将被替换，是否继续？')) {
      return;
    }
    setCode(templateCode);
    setOutput(null);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sandbox.c';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Warning Banner */}
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-amber-500/10 border-b border-amber-500/20 p-3"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-400 flex-1">
              此代码沙盒仅支持基础 C 语法高亮和简单代码模拟。实际编译执行功能需要后端支持。
            </p>
            <button
              onClick={() => setShowWarning(false)}
              className="text-amber-500 hover:text-amber-600 text-sm"
            >
              关闭
            </button>
          </div>
        </motion.div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">模板:</span>
          <div className="flex items-center gap-1">
            {EXAMPLE_TEMPLATES.map((template) => (
              <button
                key={template.name}
                onClick={() => loadTemplate(template.code)}
                className="px-3 py-1 text-xs rounded-md bg-muted hover:bg-muted/80 transition-colors"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
            title="复制代码"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? '已复制' : '复制'}
          </button>
          <button
            onClick={downloadCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
            title="下载代码"
          >
            <Download className="w-4 h-4" />
            下载
          </button>
          <button
            onClick={resetCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
            title="重置"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
        <div className="h-[400px] lg:h-[500px]">
          <Editor
            height="100%"
            defaultLanguage="c"
            value={code}
            onChange={(value) => setCode(value || '')}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              automaticLayout: true,
              tabSize: 4,
              insertSpaces: true,
              wordWrap: 'on',
              folding: true,
              renderWhitespace: 'selection',
            }}
            theme="vs-dark"
          />
        </div>

        {/* Output Panel */}
        <div className="flex flex-col h-[300px] lg:h-[500px] bg-[#1e1e1e]">
          {/* Output Toolbar */}
          <div className="flex items-center justify-between p-3 border-b border-border/20">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">输出</span>
            </div>
            <div className="flex items-center gap-3">
              {output && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {output.executionTime.toFixed(0)}ms
                </span>
              )}
              <button
                onClick={runCode}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-4 h-4" />
                {isRunning ? '运行中...' : '运行'}
              </button>
            </div>
          </div>

          {/* Output Content */}
          <div className="flex-1 p-4 font-mono text-sm overflow-auto">
            {isRunning ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                正在编译执行...
              </div>
            ) : output ? (
              <div className="space-y-2">
                {output.exitCode === 0 ? (
                  <div className="text-green-500 text-xs">✓ 执行成功 (exit code: {output.exitCode})</div>
                ) : (
                  <div className="text-red-500 text-xs">✗ 执行失败 (exit code: {output.exitCode})</div>
                )}
                
                {output.stdout && (
                  <pre className="text-foreground whitespace-pre-wrap">{output.stdout}</pre>
                )}
                
                {output.stderr && (
                  <pre className="text-red-400 whitespace-pre-wrap">{output.stderr}</pre>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                <p>点击"运行"按钮执行代码</p>
                <p className="text-xs mt-2 text-muted-foreground/60">
                  提示: 使用 printf() 输出内容到控制台
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>Ln {code.split('\n').length}, Col {code.split('\n').pop()?.length || 0}</span>
          <span>UTF-8</span>
          <span>C</span>
        </div>
        <div className="flex items-center gap-1">
          <Settings className="w-3 h-3" />
          <span>Monaco Editor</span>
        </div>
      </div>
    </div>
  );
}
