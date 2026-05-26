import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Clock,
  BookOpen,
  PlayCircle,
  CheckCircle2,
  Lock,
  Trophy,
  Target,
  TrendingUp,
  GraduationCap,
} from 'lucide-react';
import { learningPaths, getPathProgress, badges, getTotalLearningHours } from '../data/learningPaths';

const levelLabels: Record<string, { label: string; color: string }> = {
  beginner: { label: '入门', color: 'bg-green-500/10 text-green-500' },
  intermediate: { label: '进阶', color: 'bg-blue-500/10 text-blue-500' },
  advanced: { label: '高级', color: 'bg-purple-500/10 text-purple-500' },
};

const typeIcons = {
  video: PlayCircle,
  article: BookOpen,
  quiz: Target,
  practice: TrendingUp,
};

export function LearningPathsPage() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const stats = useMemo(() => {
    const totalHours = getTotalLearningHours();
    const completedPaths = learningPaths.filter(
      path => getPathProgress(path.id) >= path.steps.length
    ).length;
    const inProgressPaths = learningPaths.filter(
      path => {
        const progress = getPathProgress(path.id);
        return progress > 0 && progress < path.steps.length;
      }
    ).length;

    return { totalHours, completedPaths, inProgressPaths };
  }, []);

  const selectedPathData = selectedPath
    ? learningPaths.find(p => p.id === selectedPath)
    : null;

  return (
    <div className="min-h-screen pt-16">
      <Helmet>
        <title>学习路径 - YuleTech | 系统化成长计划</title>
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
              <GraduationCap className="w-4 h-4" />
              学习成长
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
            >
              系统化学习路径
              <span className="text-gradient-accent"> 助力成长</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-3xl mx-auto"
            >
              从入门到精通，三条系统化学习路径帮你掌握 AutoSAR BSW 开发。
              每个路径包含视频、文档、练习和测试，让学习更有目标。
            </motion.p>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto"
          >
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-primary">{stats.totalHours}h</div>
              <div className="text-sm text-muted-foreground">累计学习时间</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-primary">{stats.completedPaths}</div>
              <div className="text-sm text-muted-foreground">已完成路径</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-primary">{stats.inProgressPaths}</div>
              <div className="text-sm text-muted-foreground">进行中</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Learning Paths */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {learningPaths.map((path, index) => {
              const progress = getPathProgress(path.id);
              const progressPercent = (progress / path.steps.length) * 100;
              const isCompleted = progress >= path.steps.length;

              return (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedPath(path.id)}
                  className={`group bg-card border rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-elegant ${
                    selectedPath === path.id
                      ? 'border-primary ring-1 ring-primary'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  {/* Header */}
                  <div className={`h-24 bg-gradient-to-r ${path.color} p-6 flex items-center justify-between`}>
                    <div>
                      <span className="text-4xl">{path.badge}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${levelLabels[path.level].color}`}>
                      {levelLabels[path.level].label}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {path.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {path.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {path.estimatedHours} 小时
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {path.steps.length} 个步骤
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">进度</span>
                        <span className="font-medium">
                          {progress} / {path.steps.length}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isCompleted ? 'bg-green-500' : 'bg-primary'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {isCompleted && (
                      <div className="mt-4 flex items-center gap-2 text-green-500 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>已完成</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Selected Path Detail */}
      {selectedPathData && (
        <section className="py-16 bg-muted/30 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <button
                  onClick={() => setSelectedPath(null)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  ← 返回
                </button>
                <div>
                  <h2 className="text-2xl font-bold">{selectedPathData.title}</h2>
                  <p className="text-muted-foreground">{selectedPathData.description}</p>
                </div>
              </div>

              {/* Steps Timeline */}
              <div className="space-y-4">
                {selectedPathData.steps.map((step, index) => {
                  const StepIcon = typeIcons[step.type];
                  const isLocked = index > getPathProgress(selectedPathData.id);

                  return (
                    <div
                      key={step.id}
                      className={`flex items-start gap-4 p-4 bg-card border rounded-xl ${
                        isLocked ? 'opacity-60' : ''
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isLocked
                          ? 'bg-muted'
                          : 'bg-primary/10'
                      }`}>
                        {isLocked ? (
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <StepIcon className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{step.title}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {step.duration} 分钟
                            </span>
                            <span className="capitalize px-2 py-0.5 bg-muted rounded text-xs">
                              {step.type === 'video' ? '视频' :
                               step.type === 'article' ? '文档' :
                               step.type === 'quiz' ? '测试' : '实践'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Badges Section */}
      <section className="py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Trophy className="w-8 h-8 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">学习成就</h2>
            <p className="text-muted-foreground">完成学习目标，收集专属徽章</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {badges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/30 transition-colors"
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h4 className="font-medium mb-1">{badge.name}</h4>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
