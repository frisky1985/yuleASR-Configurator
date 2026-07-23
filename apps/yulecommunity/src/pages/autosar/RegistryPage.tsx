import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, Download, Package, Layers, ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import { DevHubLayout } from '../../components/autosar/DevHubLayout';
import { ModuleCard } from '../../components/autosar/ModuleCard';
import { REGISTRY_MODULES, getRegistryStats, fetchRegistryList, fetchRegistryStats as fetchStats } from '../../data/autosar/registry-samples';
import { LAYER_OPTIONS, MCU_OPTIONS, OS_OPTIONS } from '../../data/autosar/registry-types';
import type { RegistryFilter } from '../../data/autosar/registry-types';
import type { RegistryModule } from '../../data/autosar/registry-types';

export function RegistryPage() {
  const [filters, setFilters] = useState<RegistryFilter>({
    search: '',
    layer: '',
    mcu: '',
    os: '',
    sort: 'downloads',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('autosar-registry-search-history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [modules, setModules] = useState<RegistryModule[]>(REGISTRY_MODULES);
  const [serverStats, setServerStats] = useState<{ totalModules: number; totalDownloads: number; layers: string[]; mcus: string[] } | null>(null);

  // 尝试从后端获取数据
  useEffect(() => {
    fetchRegistryList().then(res => {
      if (res?.data?.length) setModules(res.data);
    });
    fetchStats().then(s => {
      if (s) {
        setServerStats({
          totalModules: s.totalModules,
          totalDownloads: s.totalDownloads,
          layers: REGISTRY_MODULES.map(m => m.layer).filter((v,i,a) => a.indexOf(v)===i),
          mcus: s.mcus || [],
        });
      }
    });
  }, []);

  const stats = useMemo(() => serverStats || getRegistryStats(), [serverStats]);

  // Save search history to localStorage
  useEffect(() => {
    localStorage.setItem('autosar-registry-search-history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const filteredModules = useMemo(() => {
    let list = [...modules];

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        m =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.tags.some(t => t.toLowerCase().includes(q)) ||
          m.author.toLowerCase().includes(q)
      );
    }

    // Layer filter
    if (filters.layer) {
      list = list.filter(m => m.layer === filters.layer);
    }

    // MCU filter
    if (filters.mcu) {
      list = list.filter(m => m.compatibility.mcu.includes(filters.mcu));
    }

    // OS filter
    if (filters.os) {
      list = list.filter(m => m.compatibility.os.includes(filters.os));
    }

    // Sort
    switch (filters.sort) {
      case 'downloads':
        list.sort((a, b) => b.stats.downloads - a.stats.downloads);
        break;
      case 'rating':
        list.sort((a, b) => b.stats.rating - a.stats.rating);
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.timestamps.created).getTime() - new Date(a.timestamps.created).getTime());
        break;
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return list;
  }, [filters]);

  // When search query changes with results, save to history
  const prevSearchRef = useRef(filters.search);

  // 重新筛选时，如果已有后端数据，尝试从后端精确搜索
  useEffect(() => {
    const q = filters.search.trim();
    if (!q) return;
    const timer = setTimeout(() => {
      fetchRegistryList({
        search: q || undefined,
        layer: filters.layer || undefined,
        mcu: filters.mcu || undefined,
        os: filters.os || undefined,
        sort: filters.sort,
      }).then(res => {
        if (res?.data?.length) setModules(res.data);
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [filters.search, filters.layer, filters.mcu, filters.os, filters.sort]);
  useEffect(() => {
    const currentSearch = filters.search.trim();
    const prevSearch = prevSearchRef.current.trim();
    prevSearchRef.current = filters.search;

    if (currentSearch && currentSearch !== prevSearch && filteredModules.length > 0) {
      setSearchHistory(prev => {
        const filtered = prev.filter(s => s !== currentSearch);
        return [currentSearch, ...filtered].slice(0, 5);
      });
    }
  }, [filters.search, filteredModules.length]);

  const handleClearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('autosar-registry-search-history');
  }, []);

  const handleHistoryClick = useCallback((term: string) => {
    setFilters(prev => ({ ...prev, search: term }));
    setIsSearchFocused(false);
  }, []);

  return (
    <DevHubLayout title="模块仓库" backTo="/autosar">
      <Helmet>
        <title>BSW 模块仓库 - AutoSAR 开发者中心 - YuleTech</title>
        <meta name="description" content="社区共建的 AutoSAR BSW 模块模板仓库，支持搜索、筛选和一键导入 yuleASR 配置器。" />
      </Helmet>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 pb-8"
      >
        {[
          { icon: Package, label: '模块总数', value: `${stats.totalModules}`, desc: 'BSW 模块' },
          { icon: Download, label: '总下载量', value: `${(stats.totalDownloads / 1000).toFixed(1)}k`, desc: '社区下载' },
          { icon: Layers, label: '层级覆盖', value: `${stats.layers.length}`, desc: 'MCAL/ECUAL/Service' },
          { icon: Filter, label: 'MCU 支持', value: `${stats.mcus.length}`, desc: '芯片型号' },
        ].map((stat, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
          >
            <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.desc}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Search + Sort Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={filters.search}
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="搜索模块名称、描述、标签..."
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {/* Search History Dropdown */}
              {isSearchFocused && !filters.search && searchHistory.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                  <div className="px-3 py-2 text-[10px] text-muted-foreground font-medium border-b border-border flex items-center justify-between">
                    <span>搜索历史</span>
                    <button
                      onClick={handleClearHistory}
                      className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      清除历史
                    </button>
                  </div>
                  {searchHistory.map((term) => (
                    <button
                      key={term}
                      onMouseDown={(e) => { e.preventDefault(); handleHistoryClick(term); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted/20 transition-colors flex items-center gap-2"
                    >
                      <Search className="w-3 h-3 text-muted-foreground shrink-0" />
                      {term}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-sm rounded-lg border transition-colors ${
                  showFilters
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                筛选
              </button>

              <div className="flex items-center gap-1.5 px-3 py-2.5 text-sm rounded-lg bg-card border border-border">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <select
                  value={filters.sort}
                  onChange={e => setFilters(prev => ({ ...prev, sort: e.target.value as RegistryFilter['sort'] }))}
                  className="bg-transparent text-sm focus:outline-none cursor-pointer"
                >
                  <option value="downloads">按下载量</option>
                  <option value="rating">按评分</option>
                  <option value="newest">最新发布</option>
                  <option value="name">按名称</option>
                </select>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-card border border-border"
            >
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">层级</label>
                <select
                  value={filters.layer}
                  onChange={e => setFilters(prev => ({ ...prev, layer: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">全部层级</option>
                  {LAYER_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label} - {opt.description}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">MCU</label>
                <select
                  value={filters.mcu}
                  onChange={e => setFilters(prev => ({ ...prev, mcu: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">全部 MCU</option>
                  {MCU_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">操作系统</label>
                <select
                  value={filters.os}
                  onChange={e => setFilters(prev => ({ ...prev, os: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">全部 OS</option>
                  {OS_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredModules.length > 0 ? (
            filteredModules.map((mod, i) => (
              <ModuleCard key={mod.id} module={mod} index={i} />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-1">未找到匹配模块</h3>
              <p className="text-sm text-muted-foreground/70">尝试调整筛选条件或搜索关键词</p>
            </div>
          )}
        </div>
    </DevHubLayout>
  );
}
