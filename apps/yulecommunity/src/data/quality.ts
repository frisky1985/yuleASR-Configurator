export interface QualityMetric {
  name: string;
  description: string;
  score: number; // 0-100
  weight: number; // 0-1
}

export interface QualityBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  minScore: number;
  category: 'overall' | 'code' | 'test' | 'docs';
}

export interface ModuleQuality {
  moduleId: string;
  moduleName: string;
  version: string;
  overallScore: number;
  metrics: QualityMetric[];
  badges: string[];
  lastAnalyzed: string;
}

export const qualityBadges: QualityBadge[] = [
  // Overall badges
  { id: 'excellent', name: '极优', icon: '🏆', description: '综合评分达到 90+', minScore: 90, category: 'overall' },
  { id: 'great', name: '优秀', icon: '⭐', description: '综合评分达到 80+', minScore: 80, category: 'overall' },
  { id: 'good', name: '良好', icon: '👍', description: '综合评分达到 70+', minScore: 70, category: 'overall' },
  { id: 'pass', name: '合格', icon: '✅', description: '综合评分达到 60+', minScore: 60, category: 'overall' },

  // Code quality badges
  { id: 'clean-code', name: '优质代码', icon: '✨', description: '代码质量分达到 85+', minScore: 85, category: 'code' },
  { id: 'secure', name: '安全可靠', icon: '🔒', description: '安全评分达到 90+', minScore: 90, category: 'code' },
  { id: 'performant', name: '性能优异', icon: '🚀', description: '性能评分达到 85+', minScore: 85, category: 'code' },

  // Test badges
  { id: 'well-tested', name: '测试充分', icon: '🧪', description: '测试覆盖率达到 80+', minScore: 80, category: 'test' },
  { id: 'stable', name: '稳定可靠', icon: '🤝', description: '测试通过率达到 95+', minScore: 95, category: 'test' },

  // Documentation badges
  { id: 'documented', name: '文档完善', icon: '📚', description: '文档评分达到 80+', minScore: 80, category: 'docs' },
  { id: 'maintainable', name: '易于维护', icon: '🔧', description: '可维护性评分达到 80+', minScore: 80, category: 'docs' },
];

export const moduleQualityData: ModuleQuality[] = [
  {
    moduleId: 'adc',
    moduleName: 'ADC Driver',
    version: '2.1.0',
    overallScore: 87,
    metrics: [
      { name: '代码规范', description: '代码结构、命名、注释规范度', score: 92, weight: 0.2 },
      { name: '可测试性', description: '单元测试覆盖率和质量', score: 88, weight: 0.2 },
      { name: '安全性', description: '代码安全检查和漏洞修复', score: 85, weight: 0.2 },
      { name: '性能', description: '执行效率和资源占用', score: 90, weight: 0.2 },
      { name: '文档', description: '技术文档完整性', score: 82, weight: 0.2 },
    ],
    badges: ['great', 'clean-code', 'well-tested', 'documented'],
    lastAnalyzed: '2024-01-15',
  },
  {
    moduleId: 'can',
    moduleName: 'CAN Driver',
    version: '3.0.1',
    overallScore: 91,
    metrics: [
      { name: '代码规范', description: '代码结构、命名、注释规范度', score: 94, weight: 0.2 },
      { name: '可测试性', description: '单元测试覆盖率和质量', score: 91, weight: 0.2 },
      { name: '安全性', description: '代码安全检查和漏洞修复', score: 88, weight: 0.2 },
      { name: '性能', description: '执行效率和资源占用', score: 93, weight: 0.2 },
      { name: '文档', description: '技术文档完整性', score: 89, weight: 0.2 },
    ],
    badges: ['excellent', 'clean-code', 'secure', 'well-tested', 'maintainable'],
    lastAnalyzed: '2024-01-14',
  },
  {
    moduleId: 'spi',
    moduleName: 'SPI Driver',
    version: '1.8.2',
    overallScore: 78,
    metrics: [
      { name: '代码规范', description: '代码结构、命名、注释规范度', score: 82, weight: 0.2 },
      { name: '可测试性', description: '单元测试覆盖率和质量', score: 75, weight: 0.2 },
      { name: '安全性', description: '代码安全检查和漏洞修复', score: 79, weight: 0.2 },
      { name: '性能', description: '执行效率和资源占用', score: 81, weight: 0.2 },
      { name: '文档', description: '技术文档完整性', score: 73, weight: 0.2 },
    ],
    badges: ['good', 'maintainable'],
    lastAnalyzed: '2024-01-13',
  },
  {
    moduleId: 'gpio',
    moduleName: 'GPIO Driver',
    version: '2.3.0',
    overallScore: 94,
    metrics: [
      { name: '代码规范', description: '代码结构、命名、注释规范度', score: 96, weight: 0.2 },
      { name: '可测试性', description: '单元测试覆盖率和质量', score: 94, weight: 0.2 },
      { name: '安全性', description: '代码安全检查和漏洞修复', score: 93, weight: 0.2 },
      { name: '性能', description: '执行效率和资源占用', score: 95, weight: 0.2 },
      { name: '文档', description: '技术文档完整性', score: 92, weight: 0.2 },
    ],
    badges: ['excellent', 'clean-code', 'secure', 'well-tested', 'documented', 'maintainable'],
    lastAnalyzed: '2024-01-12',
  },
];

export function calculateOverallScore(metrics: QualityMetric[]): number {
  const weightedSum = metrics.reduce((sum, m) => sum + m.score * m.weight, 0);
  return Math.round(weightedSum);
}

export function getEarnedBadges(overallScore: number, metrics: QualityMetric[]): string[] {
  const badges: string[] = [];

  // Overall badges
  if (overallScore >= 90) badges.push('excellent');
  else if (overallScore >= 80) badges.push('great');
  else if (overallScore >= 70) badges.push('good');
  else if (overallScore >= 60) badges.push('pass');

  // Category badges
  const codeMetric = metrics.find(m => m.name === '代码规范');
  const testMetric = metrics.find(m => m.name === '可测试性');
  const securityMetric = metrics.find(m => m.name === '安全性');
  const performanceMetric = metrics.find(m => m.name === '性能');
  const docsMetric = metrics.find(m => m.name === '文档');

  if (codeMetric && codeMetric.score >= 85) badges.push('clean-code');
  if (securityMetric && securityMetric.score >= 90) badges.push('secure');
  if (performanceMetric && performanceMetric.score >= 85) badges.push('performant');
  if (testMetric && testMetric.score >= 80) badges.push('well-tested');
  if (testMetric && testMetric.score >= 95) badges.push('stable');
  if (docsMetric && docsMetric.score >= 80) badges.push('documented');
  if (docsMetric && docsMetric.score >= 80) badges.push('maintainable');

  return badges;
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-500';
  if (score >= 80) return 'text-blue-500';
  if (score >= 70) return 'text-yellow-500';
  if (score >= 60) return 'text-orange-500';
  return 'text-red-500';
}

export function getScoreBg(score: number): string {
  if (score >= 90) return 'bg-green-500';
  if (score >= 80) return 'bg-blue-500';
  if (score >= 70) return 'bg-yellow-500';
  if (score >= 60) return 'bg-orange-500';
  return 'bg-red-500';
}
