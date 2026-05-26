export interface LearningStep {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'practice';
  duration: number; // minutes
  completed?: boolean;
}

export interface LearningPath {
  id: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  estimatedHours: number;
  badge: string;
  color: string;
  steps: LearningStep[];
}

export const learningPaths: LearningPath[] = [
  {
    id: 'autosar-basics',
    title: 'AutoSAR BSW 入门',
    level: 'beginner',
    description: '从零开始学习 AutoSAR 基础软件，掌握 BSW 架构和核心概念。',
    estimatedHours: 20,
    badge: '🌱',
    color: 'from-green-500/20 to-emerald-500/20',
    steps: [
      { id: '1', title: 'AutoSAR 简介与架构概述', type: 'video', duration: 45 },
      { id: '2', title: 'BSW 分层架构详解', type: 'article', duration: 30 },
      { id: '3', title: 'MCAL 层基础概念', type: 'video', duration: 60 },
      { id: '4', title: 'ECUAL 层接口介绍', type: 'video', duration: 50 },
      { id: '5', title: '入门知识测试', type: 'quiz', duration: 20 },
      { id: '6', title: 'Hello AutoSAR 实践', type: 'practice', duration: 90 },
    ],
  },
  {
    id: 'mcal-development',
    title: 'MCAL 驱动开发',
    level: 'intermediate',
    description: '深入学习微控制器驱动开发，掌握 CAN、SPI、ADC 等外设驱动。',
    estimatedHours: 40,
    badge: '🔧',
    color: 'from-blue-500/20 to-cyan-500/20',
    steps: [
      { id: '1', title: 'MCAL 规范解读', type: 'article', duration: 60 },
      { id: '2', title: 'Port 驱动开发实战', type: 'video', duration: 90 },
      { id: '3', title: 'DIO 与中断处理', type: 'video', duration: 75 },
      { id: '4', title: 'CAN 控制器配置', type: 'video', duration: 120 },
      { id: '5', title: 'SPI 通信协议实现', type: 'practice', duration: 180 },
      { id: '6', title: 'ADC 采样与 DMA', type: 'video', duration: 90 },
      { id: '7', title: 'MCAL 驱动测试', type: 'quiz', duration: 30 },
    ],
  },
  {
    id: 'system-integration',
    title: '系统集成与调试',
    level: 'advanced',
    description: '学习复杂系统级集成，掌握调试技巧和性能优化方法。',
    estimatedHours: 60,
    badge: '🚀',
    color: 'from-purple-500/20 to-pink-500/20',
    steps: [
      { id: '1', title: '系统集成架构设计', type: 'video', duration: 90 },
      { id: '2', title: '调试技巧与工具链', type: 'article', duration: 60 },
      { id: '3', title: 'JTAG 调试实战', type: 'practice', duration: 120 },
      { id: '4', title: '性能分析与优化', type: 'video', duration: 90 },
      { id: '5', title: '内存管理与优化', type: 'video', duration: 75 },
      { id: '6', title: '错误处理与诊断', type: 'practice', duration: 150 },
      { id: '7', title: '高级调试案例分析', type: 'article', duration: 45 },
      { id: '8', title: '系统集成综合测试', type: 'quiz', duration: 45 },
    ],
  },
];

export const badges = [
  {
    id: 'first-step',
    name: '起步者',
    description: '完成第一个学习步骤',
    icon: '🎯',
    condition: 'steps >= 1',
  },
  {
    id: 'path-completer',
    name: '路径完成者',
    description: '完成任意一个学习路径',
    icon: '🏆',
    condition: 'paths >= 1',
  },
  {
    id: 'knowledge-seeker',
    name: '求知者',
    description: '累计学习 10 小时',
    icon: '📚',
    condition: 'hours >= 10',
  },
  {
    id: 'master',
    name: '大师',
    description: '完成所有初级和中级路径',
    icon: '👑',
    condition: 'beginner >= 1 && intermediate >= 1',
  },
  {
    id: 'expert',
    name: '专家',
    description: '完成所有学习路径',
    icon: '🌟',
    condition: 'all_paths >= 3',
  },
];

export function getPathProgress(pathId: string): number {
  const saved = localStorage.getItem(`learning-progress-${pathId}`);
  if (!saved) return 0;
  try {
    const progress = JSON.parse(saved);
    return progress.completedSteps || 0;
  } catch {
    return 0;
  }
}

export function savePathProgress(pathId: string, completedSteps: number) {
  localStorage.setItem(
    `learning-progress-${pathId}`,
    JSON.stringify({ completedSteps, updatedAt: Date.now() })
  );
}

export function getTotalLearningHours(): number {
  let hours = 0;
  learningPaths.forEach(path => {
    const progress = getPathProgress(path.id);
    const completedRatio = progress / path.steps.length;
    hours += path.estimatedHours * completedRatio;
  });
  return Math.round(hours);
}
