import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Cpu,
  Wifi,
  Database,
  Layers,
  Upload,
  Loader2,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { BSWTemplateCard } from '../components/BSWTemplateCard';
import { bswTemplateApi } from '../services/bswTemplateApi';
import type { BSWTemplate, TemplateCategory } from '../types/bswTemplate';

const categories: { key: TemplateCategory | 'all'; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'All', icon: <Layers className="w-4 h-4" /> },
  { key: 'mcal', label: 'MCAL', icon: <Cpu className="w-4 h-4" /> },
  { key: 'ecual', label: 'ECUAL', icon: <Wifi className="w-4 h-4" /> },
  { key: 'service', label: 'Service', icon: <Database className="w-4 h-4" /> },
  { key: 'full', label: 'Full', icon: <Layers className="w-4 h-4" /> },
  { key: 'bsw', label: 'BSW', icon: <Layers className="w-4 h-4" /> },
];

const sortOptions = [
  { value: 'downloadCount', label: 'Most Downloaded' },
  { value: 'createdAt', label: 'Newest' },
  { value: 'name', label: 'Name' },
  { value: 'viewCount', label: 'Most Viewed' },
];

export function BSWTemplateMarketPage() {
  const [templates, setTemplates] = useState<BSWTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState('downloadCount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const result = await bswTemplateApi.list({
        category: activeCategory === 'all' ? undefined : activeCategory,
        search: search || undefined,
        sortBy: sortBy as any,
        sortOrder,
        page,
        pageSize: 12,
      });
      setTemplates(result.data);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleCategoryChange = (cat: TemplateCategory | 'all') => {
    setActiveCategory(cat);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            BSW Template Market
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Browse, discover and use community BSW configuration templates
          </p>
        </div>
        <Link
          to="/templates-market/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <Upload className="w-4 h-4" />
          Upload Template
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={e => handleSortChange(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={toggleSortOrder}
              className="p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              title={sortOrder === 'desc' ? 'Descending' : 'Ascending'}
            >
              <ArrowUpDown
                className={`w-4 h-4 text-slate-500 ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => handleCategoryChange(cat.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat.key
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-transparent'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {total} template{total !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Template Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20">
          <Layers className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">
            No templates found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }
        >
          {templates.map(template => (
            <BSWTemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 3, totalPages - 6));
            const pageNum = start + i;
            if (pageNum > totalPages) return null;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  page === pageNum
                    ? 'bg-primary-600 text-white'
                    : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
