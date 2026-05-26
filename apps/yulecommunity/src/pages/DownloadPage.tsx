import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Wrench, FileText, BookOpen, Code, Download, HardDrive } from 'lucide-react';

type DownloadCategory = '全部' | '工具链' | '手册' | '笔记' | '代码';

interface DownloadItem {
  id: string;
  name: string;
  version: string;
  size: string;
  description: string;
  category: DownloadCategory;
}

const categoryLabels: Record<DownloadCategory, string> = {
  '全部': '全部',
  '工具链': '工具链',
  '手册': '手册',
  '笔记': '笔记',
  '代码': '代码',
};

const downloadItems: DownloadItem[] = [
  {
    id: 'dl-1',
    name: 'YuleConfig Generator',
    version: 'v2.4.1',
    size: '156 MB',
    description: 'AutoSAR BSW 配置代码生成工具，支持 MCAL、ECUAL 和 Service 层模块配置。',
    category: '工具链',
  },
  {
    id: 'dl-2',
    name: 'ARM GCC 交叉编译器',
    version: 'v13.2.rel1',
    size: '280 MB',
    description: 'ARM GCC 交叉编译工具链，支持 AArch64 和 ARMv7-A。',
    category: '工具链',
  },
  {
    id: 'dl-3',
    name: 'Lauterbach TRACE32',
    version: 'v2026.04',
    size: '1.2 GB',
    description: '调试器软件套件，包含 JTAG 调试脚本和 Flash 编程工具。',
    category: '工具链',
  },
  {
    id: 'dl-4',
    name: '处理器 Reference Manual',
    version: 'Rev. 3',
    size: '45 MB',
    description: '处理器完整参考手册，涵盖所有外设寄存器详细说明。',
    category: '手册',
  },
  {
    id: 'dl-5',
    name: '处理器 Datasheet',
    version: 'Rev. 2.1',
    size: '8 MB',
    description: '芯片数据手册，包含电气特性、引脚定义和封装信息。',
    category: '手册',
  },
  {
    id: 'dl-6',
    name: 'MCAL 配置指南',
    version: 'v1.3',
    size: '12 MB',
    description: 'YuleTech MCAL 模块配置详细指南，包含 Port、Dio、Can、Spi 等驱动配置示例。',
    category: '笔记',
  },
  {
    id: 'dl-7',
    name: 'CAN 诊断实践手册',
    version: 'v1.0',
    size: '6 MB',
    description: '基于 UDS 协议的 CAN 诊断实现指南，涵盖 Dcm、Dem 模块配置与故障码处理。',
    category: '笔记',
  },
  {
    id: 'dl-8',
    name: 'BSW 示例项目',
    version: 'v3.2.0',
    size: '32 MB',
    description: '完整的 AutoSAR BSW 示例项目，包含从 MCAL 到 RTE 的完整配置和代码。',
    category: '代码',
  },
  {
    id: 'dl-9',
    name: '驱动模板合集',
    version: 'v1.1',
    size: '4 MB',
    description: 'MCAL 驱动开发模板，包含标准驱动框架、中断处理模板和 MemMap 分区示例。',
    category: '代码',
  },
];

const categories: DownloadCategory[] = ['全部', '工具链', '手册', '笔记', '代码'];

function getCategoryIcon(category: DownloadCategory) {
  switch (category) {
    case '工具链':
      return <Wrench className="w-6 h-6" />;
    case '手册':
      return <FileText className="w-6 h-6" />;
    case '笔记':
      return <BookOpen className="w-6 h-6" />;
    case '代码':
      return <Code className="w-6 h-6" />;
    default:
      return <HardDrive className="w-6 h-6" />;
  }
}

export function DownloadPage() {
  const [activeCategory, setActiveCategory] = useState<DownloadCategory>('全部');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = downloadItems.filter((item) => {
    const matchCategory = activeCategory === '全部' || item.category === activeCategory;
    const matchSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleDownload = (name: string) => {
    alert(`开始下载：${name}`);
  };

  return (
    <div className="min-h-screen pt-16">
      <Helmet>
        <title>下载中心 - YuleTech | 工具链、手册、示例代码</title>
        <meta name="description" content="获取 YuleTech AutoSAR BSW 开发所需的工具链、数据手册、应用笔记和示例代码。一站式资源下载平台。" />
      </Helmet>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-[hsl(var(--primary))]/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-sm font-medium mb-6">
              <Download className="w-4 h-4" />
              下载中心
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              资源
              <span className="text-gradient-accent"> 下载中心</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              获取 YuleTech AutoSAR BSW 开发所需的工具链、数据手册、应用笔记和示例代码。
            </p>
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索资源名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/50 shadow-elegant"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-[hsl(var(--primary))] text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Download Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {searchQuery ? `搜索结果："${searchQuery}"` : categoryLabels[activeCategory]}
            </h2>
            <span className="text-sm text-muted-foreground">共 {filteredItems.length} 项</span>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <HardDrive className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>没有找到相关资源</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group bg-card border border-border rounded-xl p-6 hover:border-[hsl(var(--accent))]/30 transition-all hover:shadow-elegant flex flex-col"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] flex items-center justify-center">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-[hsl(var(--accent))] transition-colors truncate">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="px-2 py-0.5 bg-muted rounded-md">{item.version}</span>
                      <span>{item.size}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-6 flex-1">{item.description}</p>
                <button
                  onClick={() => handleDownload(item.name)}
                  className="w-full flex items-center justify-center gap-2 bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--primary-glow))] transition-colors px-4 py-2.5 rounded-lg text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  立即下载
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
