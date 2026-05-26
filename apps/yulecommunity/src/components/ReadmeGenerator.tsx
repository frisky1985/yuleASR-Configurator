import { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Copy, 
  Check,
  Code,
  Shield,
  Zap,
  ExternalLink,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

// README 模板定义
interface ReadmeTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  sections: string[];
}

// 配置选项
interface GeneratorConfig {
  projectName: string;
  description: string;
  version: string;
  author: string;
  license: string;
  repoUrl: string;
  demoUrl: string;
  features: string[];
  techStack: string[];
  installation: string;
  usage: string;
  contributing: boolean;
  badges: boolean;
  toc: boolean;
  screenshots: boolean;
}

const TEMPLATES: ReadmeTemplate[] = [
  {
    id: 'standard',
    name: '标准模板',
    description: '适合大多数开源项目的通用 README',
    icon: <FileText className="w-5 h-5" />,
    sections: ['title', 'badges', 'description', 'features', 'demo', 'installation', 'usage', 'tech-stack', 'contributing', 'license']
  },
  {
    id: 'autosar',
    name: 'AutoSAR 模块',
    description: '专为 AutoSAR BSW 模块设计的 README',
    icon: <Code className="w-5 h-5" />,
    sections: ['title', 'badges', 'overview', 'architecture', 'features', 'dependencies', 'configuration', 'api-reference', 'integration', 'testing', 'license']
  },
  {
    id: 'minimal',
    name: '简洁模板',
    description: '精简主义，只包含必要信息',
    icon: <Zap className="w-5 h-5" />,
    sections: ['title', 'description', 'installation', 'usage']
  },
  {
    id: 'enterprise',
    name: '企业模板',
    description: '包含完整文档和规范说明',
    icon: <Shield className="w-5 h-5" />,
    sections: ['title', 'badges', 'description', 'features', 'requirements', 'installation', 'configuration', 'usage', 'security', 'contributing', 'code-of-conduct', 'license', 'acknowledgments']
  }
];

const LICENSES = [
  { id: 'mit', name: 'MIT License', badge: 'MIT' },
  { id: 'apache-2.0', name: 'Apache License 2.0', badge: 'Apache-2.0' },
  { id: 'gpl-3.0', name: 'GNU GPL v3.0', badge: 'GPL-3.0' },
  { id: 'bsd-3', name: 'BSD 3-Clause', badge: 'BSD-3-Clause' },
  { id: 'mpl-2.0', name: 'Mozilla Public License 2.0', badge: 'MPL-2.0' },
  { id: 'proprietary', name: '专有许可', badge: 'Proprietary' }
];

const TECH_STACK_OPTIONS = [
  'C', 'C++', 'Python', 'JavaScript', 'TypeScript', 'Rust', 'Go',
  'AutoSAR', 'CMake', 'Docker', 'Linux', 'QEMU', 'Make'
];

export function ReadmeGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<ReadmeTemplate>(TEMPLATES[0]);
  const [config, setConfig] = useState<GeneratorConfig>({
    projectName: 'yuletech-can',
    description: 'AutoSAR CAN 驱动模块实现，支持 CAN 2.0B 和 CAN-FD',
    version: '1.0.0',
    author: 'YuleTech',
    license: 'mit',
    repoUrl: 'https://github.com/frisky1985/yuletech-can',
    demoUrl: '',
    features: [
      '支持标准和扩展帧格式 (CAN 2.0B)',
      'CAN-FD 高速通信支持',
      '多路滤波器配置',
      '中断驱动传输',
      'MISRA C:2012 规范代码'
    ],
    techStack: ['C', 'AutoSAR', 'CMake'],
    installation: 'git clone https://github.com/frisky1985/yuletech-can.git\ncd yuletech-can\nmkdir build && cd build\ncmake ..\nmake',
    usage: '#include "Can.h"\n\n/* 初始化 CAN 模块 */\nCan_Init(&CanConfig);\n\n/* 发送消息 */\nCan_PduType pdu = {\n  .id = 0x123,\n  .length = 8,\n  .data = {0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08}\n};\nCan_Write(CAN_CONTROLLER_0, &pdu);',
    contributing: true,
    badges: true,
    toc: true,
    screenshots: false
  });

  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);

  // 生成 README 内容
  const generateReadme = (): string => {
    const lines: string[] = [];
    const { projectName, description, version, author, license, repoUrl, demoUrl, features, techStack, installation, usage, contributing, badges, toc } = config;

    // 标题
    lines.push(`# ${projectName}`);
    lines.push('');

    // Badge
    if (badges) {
      if (repoUrl.includes('github.com')) {
        lines.push(`![Version](https://img.shields.io/badge/version-${version}-blue.svg)`);
        lines.push(`![License](https://img.shields.io/badge/license-${LICENSES.find(l => l.id === license)?.badge}-green.svg)`);
        lines.push(`![Build](https://img.shields.io/badge/build-passing-success.svg)`);
        lines.push(`![MISRA](https://img.shields.io/badge/MISRA-C:2012-blueviolet.svg)`);
        lines.push('');
      }
    }

    // 目录
    if (toc) {
      lines.push('## 目录');
      lines.push('');
      lines.push('- [简介](#简介)');
      lines.push('- [功能特性](#功能特性)');
      if (demoUrl) lines.push('- [在线演示](#在线演示)');
      lines.push('- [技术栈](#技术栈)');
      lines.push('- [安装说明](#安装说明)');
      lines.push('- [使用方法](#使用方法)');
      if (contributing) lines.push('- [贡献指南](#贡献指南)');
      lines.push('- [许可证](#许可证)');
      lines.push('');
    }

    // 简介
    lines.push('## 简介');
    lines.push('');
    lines.push(description);
    lines.push('');

    // 功能特性
    if (features.length > 0) {
      lines.push('## 功能特性');
      lines.push('');
      features.forEach(feature => {
        lines.push(`- ${feature}`);
      });
      lines.push('');
    }

    // 在线演示
    if (demoUrl) {
      lines.push('## 在线演示');
      lines.push('');
      lines.push(`[点击访问在线演示](${demoUrl})`);
      lines.push('');
    }

    // 技术栈
    if (techStack.length > 0) {
      lines.push('## 技术栈');
      lines.push('');
      lines.push(techStack.map(t => `- **${t}**`).join('\n'));
      lines.push('');
    }

    // 安装说明
    if (installation) {
      lines.push('## 安装说明');
      lines.push('');
      lines.push('```bash');
      lines.push(installation);
      lines.push('```');
      lines.push('');
    }

    // 使用方法
    if (usage) {
      lines.push('## 使用方法');
      lines.push('');
      lines.push('```c');
      lines.push(usage);
      lines.push('```');
      lines.push('');
    }

    // 贡献指南
    if (contributing) {
      lines.push('## 贡献指南');
      lines.push('');
      lines.push('欢迎提交 Issue 和 Pull Request！请确保您的代码符合 MISRA C:2012 规范。');
      lines.push('');
      lines.push('1. Fork 本仓库');
      lines.push(`2. 创建您的功能分支 (\`git checkout -b feature/AmazingFeature\`)`);
      lines.push(`3. 提交更改 (\`git commit -m 'Add some AmazingFeature'\`)`);
      lines.push(`4. 推送到分支 (\`git push origin feature/AmazingFeature'\`)`);
      lines.push('5. 打开一个 Pull Request');
      lines.push('');
    }

    // 许可证
    lines.push('## 许可证');
    lines.push('');
    const licenseName = LICENSES.find(l => l.id === license)?.name || license;
    lines.push(`本项目采用 ${licenseName} 进行许可。详见 [LICENSE](LICENSE) 文件。`);
    lines.push('');

    // 联系
    lines.push('---');
    lines.push('');
    lines.push(`**作者**: ${author}  `);
    if (repoUrl) {
      lines.push(`**项目地址**: [${repoUrl}](${repoUrl})  `);
    }
    lines.push(`**版本**: v${version}`);
    lines.push('');

    return lines.join('\n');
  };

  // 复制到剪贴板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateReadme());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 下载 README
  const downloadReadme = () => {
    const content = generateReadme();
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 切换展开状态
  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // 更新配置
  const updateConfig = (key: keyof GeneratorConfig, value: string | number | boolean | string[]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // 更新功能列表
  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...config.features];
    newFeatures[index] = value;
    setConfig(prev => ({ ...prev, features: newFeatures }));
  };

  // 添加功能
  const addFeature = () => {
    setConfig(prev => ({ ...prev, features: [...prev.features, '新功能'] }));
  };

  // 删除功能
  const removeFeature = (index: number) => {
    setConfig(prev => ({ 
      ...prev, 
      features: prev.features.filter((_, i) => i !== index) 
    }));
  };

  const readme = useMemo(() => generateReadme(), [config, selectedTemplate]);

  return (
    <div className="w-full bg-card rounded-xl border border-border overflow-hidden">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">README 生成器</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? '已复制' : '复制'}
          </button>
          <button
            onClick={downloadReadme}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            下载
          </button>
        </div>
      </div>

      <div className="flex" style={{ minHeight: '600px' }}>
        {/* 左侧配置面板 */}
        <div className="w-80 border-r border-border bg-muted/10 overflow-y-auto">
          {/* 模板选择 */}
          <div className="p-4 border-b border-border">
            <div className="text-sm font-medium mb-3">选择模板</div>
            <div className="space-y-2">
              {TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                    selectedTemplate.id === template.id 
                      ? 'bg-primary/10 border border-primary/30' 
                      : 'hover:bg-muted/50 border border-transparent'
                  }`}
                >
                  <span className="text-muted-foreground">{template.icon}</span>
                  <div>
                    <div className="text-sm font-medium">{template.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{template.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 基本信息 */}
          <div className="p-4 border-b border-border">
            <button
              onClick={() => toggleSection('basic')}
              className="w-full flex items-center justify-between text-sm font-medium mb-3"
            >
              基本信息
              {expandedSections.includes('basic') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.includes('basic') && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">项目名称</label>
                  <input
                    type="text"
                    value={config.projectName}
                    onChange={(e) => updateConfig('projectName', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm rounded bg-background border border-border"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">版本</label>
                  <input
                    type="text"
                    value={config.version}
                    onChange={(e) => updateConfig('version', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm rounded bg-background border border-border"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">作者</label>
                  <input
                    type="text"
                    value={config.author}
                    onChange={(e) => updateConfig('author', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm rounded bg-background border border-border"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">许可证</label>
                  <select
                    value={config.license}
                    onChange={(e) => updateConfig('license', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm rounded bg-background border border-border"
                  >
                    {LICENSES.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 链接 */}
          <div className="p-4 border-b border-border">
            <button
              onClick={() => toggleSection('links')}
              className="w-full flex items-center justify-between text-sm font-medium mb-3"
            >
              链接
              {expandedSections.includes('links') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.includes('links') && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">代码仓库 URL</label>
                  <input
                    type="text"
                    value={config.repoUrl}
                    onChange={(e) => updateConfig('repoUrl', e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-2 py-1.5 text-sm rounded bg-background border border-border"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">演示地址 (可选)</label>
                  <input
                    type="text"
                    value={config.demoUrl}
                    onChange={(e) => updateConfig('demoUrl', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-2 py-1.5 text-sm rounded bg-background border border-border"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 功能特性 */}
          <div className="p-4 border-b border-border">
            <button
              onClick={() => toggleSection('features')}
              className="w-full flex items-center justify-between text-sm font-medium mb-3"
            >
              功能特性
              {expandedSections.includes('features') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.includes('features') && (
              <div className="space-y-2">
                {config.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="flex-1 px-2 py-1.5 text-sm rounded bg-background border border-border"
                    />
                    <button
                      onClick={() => removeFeature(index)}
                      className="p-1.5 rounded hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addFeature}
                  className="w-full py-1.5 text-xs rounded border border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition-colors"
                >
                  + 添加功能
                </button>
              </div>
            )}
          </div>

          {/* 技术栈 */}
          <div className="p-4 border-b border-border">
            <button
              onClick={() => toggleSection('tech')}
              className="w-full flex items-center justify-between text-sm font-medium mb-3"
            >
              技术栈
              {expandedSections.includes('tech') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.includes('tech') && (
              <div className="flex flex-wrap gap-2">
                {TECH_STACK_OPTIONS.map(tech => (
                  <button
                    key={tech}
                    onClick={() => {
                      const newTech = config.techStack.includes(tech)
                        ? config.techStack.filter(t => t !== tech)
                        : [...config.techStack, tech];
                      updateConfig('techStack', newTech);
                    }}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      config.techStack.includes(tech)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 选项 */}
          <div className="p-4">
            <div className="text-sm font-medium mb-3">显示选项</div>
            <div className="space-y-2">
              {[
                { key: 'badges', label: '显示 Badge' },
                { key: 'toc', label: '目录 (TOC)' },
                { key: 'contributing', label: '贡献指南' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config[key as keyof GeneratorConfig] as boolean}
                    onChange={(e) => updateConfig(key as keyof GeneratorConfig, e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧预览区域 */}
        <div className="flex-1 bg-muted/5 flex flex-col">
          {/* 代码编辑区 */}
          <div className="flex-1 p-4">
            <div className="text-sm font-medium mb-3 flex items-center gap-2">
              <Code className="w-4 h-4" />
              预览
            </div>
            <div className="bg-muted rounded-lg p-4 overflow-auto" style={{ maxHeight: '500px' }}>
              <pre className="text-sm font-mono whitespace-pre-wrap text-foreground/90">
                {readme}
              </pre>
            </div>
          </div>

          {/* 快速编辑区 */}
          <div className="p-4 border-t border-border bg-muted/10">
            <div className="text-sm font-medium mb-3">项目描述</div>
            <textarea
              value={config.description}
              onChange={(e) => updateConfig('description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border resize-none"
            />
            <div className="text-sm font-medium mt-4 mb-3">安装命令</div>
            <textarea
              value={config.installation}
              onChange={(e) => updateConfig('installation', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border font-mono resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
