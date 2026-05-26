import { X, Scale, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { CompareModule } from '../hooks/useModuleCompare';

interface ModuleCompareBarProps {
  modules: CompareModule[];
  onRemove: (id: string) => void;
  onClear: () => void;
  maxItems: number;
}

export function ModuleCompareBar({ modules, onRemove, onClear, maxItems }: ModuleCompareBarProps) {
  const navigate = useNavigate();

  if (modules.length === 0) return null;

  const handleCompare = () => {
    if (modules.length < 2) {
      alert('请至少选择 2 个模块进行对比');
      return;
    }
    const ids = modules.map(m => m.id).join(',');
    navigate(`/compare?modules=${ids}`);
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              <span className="font-medium">
                已选择 {modules.length}/{maxItems} 个模块</span>
            </div>
            
            <div className="flex items-center gap-2">
              <AnimatePresence mode="popLayout">
                {modules.map((module) => (
                  <motion.div
                    key={module.id}
                    layout
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm"
                  >
                    <span className="font-medium">{module.name}</span>
                    <button
                      onClick={() => onRemove(module.id)}
                      className="p-0.5 hover:bg-background rounded-full transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClear}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              清空
            </button>
            <button
              onClick={handleCompare}
              disabled={modules.length < 2}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              开始对比
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
