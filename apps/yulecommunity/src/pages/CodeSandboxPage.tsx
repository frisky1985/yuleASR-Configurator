import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Code2,
  Terminal,
  BookOpen,
  Lightbulb,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { CodeSandbox } from '../components/CodeSandbox';

const TIPS = [
  {
    icon: Terminal,
    title: '支持标准 C 语法',
    desc: '高亮显示、自动补全、语法检查',
  },
  {
    icon: BookOpen,
    title: '内置示例模板',
    desc: 'Hello World、数组、指针、结构体等经典示例',
  },
  {
    icon: Lightbulb,
    title: '实时运行',
    desc: '编译并查看输出结果',
  },
];

const LIMITATIONS = [
  '不支持外部头文件引用（除标准库函数）',
  '不支持文件 I/O 操作',
  '代码执行时间限制在 5 秒以内',
  '内存使用限制在 128MB 以内',
];

export function CodeSandboxPage() {
  return (
    <div className="min-h-screen pt-16">
      <Helmet>
        <title>在线代码沙盒 - YuleTech | C 语言在线编程</title>
        <meta name="description" content="在线 C 语言代码沙盒，支持语法高亮、代码编译、实时运行，带有丰富的示例模板和学习资源。" />
      </Helmet>

      {/* Hero */}
      <section className="relative py-16 overflow-hidden bg-gradient-to-b from-[hsl(var(--primary))]/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-sm font-medium mb-6"
            >
              <Code2 className="w-4 h-4" />
              在线编程
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
            >
              C 语言代码沙盒
              <span className="text-gradient-accent"> 在线编译运行</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-3xl mx-auto"
            >
              基于 Monaco Editor 的在线 C 语言编程环境，支持语法高亮、自动补全、实时编译。
              内置丰富的代码模板，帮助你快速上手 AutoSAR BSW 开发。
            </motion.p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CodeSandbox />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TIPS.map((tip, index) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                  <tip.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{tip.title}</h3>
                <p className="text-muted-foreground text-sm">{tip.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Limitations & Notice */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">使用限制与声明</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {LIMITATIONS.map((limitation, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                      {limitation}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                  <p className="mb-2">
                    当前版本为演示版本，使用 Monaco Editor 进行代码编辑，代码执行为模拟环境。
                    如需完整的在线编译执行功能，建议搭建后端服务使用 WebAssembly 或 Docker 容器技术。
                  </p>
                  <a
                    href="https://github.com/microsoft/monaco-editor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    了解 Monaco Editor
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-10">相关学习资源</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'C 语言基础教程', desc: '从入门到精通', link: '/learning/c-basics' },
              { title: 'AutoSAR 规范解读', desc: 'BSW 开发指南', link: '/docs/autosar' },
              { title: 'MCAL 驱动开发', desc: '微控制器驱动层', link: '/opensource' },
              { title: '实战项目', desc: '堆校与调试', link: '/learning/projects' },
            ].map((item) => (
              <a
                key={item.title}
                href={item.link}
                className="group p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-elegant transition-all"
              >
                <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                  {item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
