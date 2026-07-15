import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Star, Cpu, GitBranch } from 'lucide-react';
import type { RegistryModule } from '../../data/autosar/registry-types';

const layerColorMap: Record<string, string> = {
  MCAL: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  ECUAL: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  Service: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  RTE_ASW: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  Complex: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  System: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
};

const statusMap: Record<string, string> = {
  published: 'bg-green-500/10 text-green-600 dark:text-green-400',
  draft: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  deprecated: 'bg-red-500/10 text-red-600 dark:text-red-400',
  review: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
};

function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: 5 }, (_, i) => {
        if (i < full) return <Star key={i} className="w-3.5 h-3.5 fill-current" />;
        if (i === full && half) return <Star key={i} className="w-3.5 h-3.5 fill-current opacity-50" />;
        return <Star key={i} className="w-3.5 h-3.5 text-muted-foreground/30" />;
      })}
      <span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </span>
  );
}

interface ModuleCardProps {
  module: RegistryModule;
  index?: number;
}

export function ModuleCard({ module, index = 0 }: ModuleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/autosar/registry/${module.id}`}
        className="block group rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-elegant transition-all overflow-hidden"
      >
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${layerColorMap[module.layer] || ''}`}>
                  {module.layer}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${statusMap[module.status] || ''}`}>
                  {module.status === 'published' ? '已发布' : module.status === 'draft' ? '预览' : module.status === 'deprecated' ? '已弃用' : '审核中'}
                </span>
              </div>
              <h3 className="text-base font-semibold group-hover:text-primary transition-colors truncate">
                {module.name}
              </h3>
            </div>
            <span className="text-xs text-muted-foreground shrink-0 ml-2 font-mono">
              v{module.version}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {module.description}
          </p>

          {/* Tags */}
          {module.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {module.tags.slice(0, 4).map(tag => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 text-[10px] rounded bg-muted/50 text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
              {module.tags.length > 4 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded bg-muted/50 text-muted-foreground">
                  +{module.tags.length - 4}
                </span>
              )}
            </div>
          )}

          {/* MCU Chips */}
          <div className="flex flex-wrap gap-1 mb-3">
            {module.compatibility.mcu.slice(0, 3).map(mcu => (
              <span
                key={mcu}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded bg-primary/5 text-primary border border-primary/10"
              >
                <Cpu className="w-2.5 h-2.5" />
                {mcu}
              </span>
            ))}
            {module.compatibility.mcu.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-muted/50 text-muted-foreground">
                +{module.compatibility.mcu.length - 3}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Download className="w-3 h-3" />
                {module.stats.downloads >= 1000
                  ? `${(module.stats.downloads / 1000).toFixed(1)}k`
                  : module.stats.downloads}
              </span>
              <RatingStars rating={module.stats.rating} />
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <GitBranch className="w-3 h-3" />
              <span>{module.author.split(' ')[0]}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
