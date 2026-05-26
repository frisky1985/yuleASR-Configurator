import { useState, useCallback, useEffect } from 'react';

const COMPARE_STORAGE_KEY = 'yule-module-compare';
const MAX_COMPARE_ITEMS = 4;

export interface CompareModule {
  id: string;
  name: string;
  layer: string;
  status: string;
  version: string;
  stars: number;
  forks: number;
  desc: string;
}

export function useModuleCompare() {
  const [selectedModules, setSelectedModules] = useState<CompareModule[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(COMPARE_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSelectedModules(parsed);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(selectedModules));
  }, [selectedModules]);

  const addModule = useCallback((module: CompareModule) => {
    setSelectedModules(prev => {
      if (prev.find(m => m.id === module.id)) return prev;
      if (prev.length >= MAX_COMPARE_ITEMS) {
        alert(`最多只能对比 ${MAX_COMPARE_ITEMS} 个模块`);
        return prev;
      }
      return [...prev, module];
    });
  }, []);

  const removeModule = useCallback((moduleId: string) => {
    setSelectedModules(prev => prev.filter(m => m.id !== moduleId));
  }, []);

  const toggleModule = useCallback((module: CompareModule) => {
    setSelectedModules(prev => {
      const exists = prev.find(m => m.id === module.id);
      if (exists) {
        return prev.filter(m => m.id !== module.id);
      }
      if (prev.length >= MAX_COMPARE_ITEMS) {
        alert(`最多只能对比 ${MAX_COMPARE_ITEMS} 个模块`);
        return prev;
      }
      return [...prev, module];
    });
  }, []);

  const isSelected = useCallback((moduleId: string) => {
    return selectedModules.some(m => m.id === moduleId);
  }, [selectedModules]);

  const clearAll = useCallback(() => {
    setSelectedModules([]);
  }, []);

  const canAddMore = selectedModules.length < MAX_COMPARE_ITEMS;

  return {
    selectedModules,
    addModule,
    removeModule,
    toggleModule,
    isSelected,
    clearAll,
    canAddMore,
    maxItems: MAX_COMPARE_ITEMS,
  };
}
