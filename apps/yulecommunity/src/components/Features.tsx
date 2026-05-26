import {
  Code2,
  Wrench,
  BookOpen,
  Cpu,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ImageMarquee,
  MockCodeEditor,
  MockGithubRepo,
  MockArchDiagram,
  MockConfigTool,
  MockTerminal,
  MockDebugger,
  MockVideoPlayer,
  MockCourseList,
  MockDocPage,
  MockBoardPhoto,
  MockPinout,
  MockSpecTable,
} from './ImageMarquee';
import { OptimizedImage } from './OptimizedImage';

const baseUrl = import.meta.env.BASE_URL || '/';

const features = [
  {
    icon: Code2,
    title: '开源代码平台',
    description: '提供完整的 AutoSAR BSW 开源实现，包括 MCAL、ECUAL、Service 和 RTE 层，支持多种芯片平台。',
    image: `${baseUrl}images/feature-code.png`,
    stats: '32 个模块',
    color: 'from-blue-500/20 to-cyan-500/20',
    link: '/opensource',
    marquee: (
      <ImageMarquee speed={18}>
        <MockCodeEditor />
        <MockGithubRepo />
        <MockArchDiagram />
      </ImageMarquee>
    ),
  },
  {
    icon: Wrench,
    title: '开发工具链',
    description: '可视化配置工具、代码生成器、编译脚本和调试工具，大幅降低汽车软件开发门槛。',
    image: `${baseUrl}images/feature-toolchain.png`,
    stats: '免费使用',
    color: 'from-cyan-500/20 to-teal-500/20',
    link: '/toolchain',
    marquee: (
      <ImageMarquee speed={22}>
        <MockConfigTool />
        <MockTerminal />
        <MockDebugger />
      </ImageMarquee>
    ),
  },
  {
    icon: BookOpen,
    title: '学习成长平台',
    description: '系统化的 AutoSAR 规范解读、视频课程、实战项目和专家问答，帮助工程师快速成长。',
    image: `${baseUrl}images/feature-learning.png`,
    stats: '100+ 课程',
    color: 'from-teal-500/20 to-emerald-500/20',
    link: '/learning',
    marquee: (
      <ImageMarquee speed={20}>
        <MockVideoPlayer />
        <MockCourseList />
        <MockDocPage />
      </ImageMarquee>
    ),
  },
  {
    icon: Cpu,
    title: '硬件开发板',
    description: '开源硬件解决方案和评估开发板，支持 NXP、瑞萨、英飞凌等主流芯片，开箱即用。',
    image: `${baseUrl}images/feature-hardware.png`,
    stats: '试用申请',
    color: 'from-emerald-500/20 to-green-500/20',
    link: '/hardware',
    marquee: (
      <ImageMarquee speed={24}>
        <MockBoardPhoto />
        <MockPinout />
        <MockSpecTable />
      </ImageMarquee>
    ),
  },
];

export function Features() {
  return (
    <section id="opensource" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] text-sm font-medium mb-4">
            核心平台
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            一站式汽车基础软件
            <span className="text-gradient-accent"> 开发生态</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            从开源代码到开发工具，从学习到实战，构建完整的汽车软件工程师成长体系
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-elegant transition-shadow duration-500 flex flex-col"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden shrink-0">
                <OptimizedImage
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  priority={index < 2} // 前两个首屏可见，优先加载
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${feature.color} opacity-60`} />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs font-medium">
                    {feature.stats}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-[hsl(var(--primary))]" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Scrolling Image Preview */}
                <div className="mb-4 -mx-6 px-6">
                  {feature.marquee}
                </div>

                <a
                  href={`#${feature.link}`}
                  className="mt-auto text-sm font-medium text-[hsl(var(--accent))] hover:text-[hsl(var(--accent-glow))] transition-colors flex items-center gap-1 group/btn"
                >
                  了解更多
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
