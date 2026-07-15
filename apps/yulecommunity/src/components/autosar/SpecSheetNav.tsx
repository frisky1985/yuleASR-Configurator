import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, BookOpen } from 'lucide-react';
import { getLayers, buildSearchIndex, findApiById } from '../../data/autosar/spec-index';

interface SpecSheetNavProps {
  selectedApi: string | null;
  onSelectApi: (apiId: string) => void;
}

export function SpecSheetNav({ selectedApi, onSelectApi }: SpecSheetNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set(['MCAL']));
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set([]));
  const [searchQuery, setSearchQuery] = useState('');

  const layers = getLayers();
  const searchIndex = buildSearchIndex();

  const selectedApiObj = selectedApi ? findApiById(selectedApi) : null;

  const toggleLayer = (id: string) => {
    setExpandedLayers(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleModule = (id: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const searchResults = searchQuery.trim()
    ? searchIndex.filter(e =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.brief.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.moduleId.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 20)
    : null;

  return (
    <>
      {/* Trigger button - shows current selection */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm"
      >
        <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="flex-1 text-left truncate">
          {selectedApiObj ? `${selectedApiObj.moduleId} › ${selectedApiObj.name}` : '选择模块/API'}
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>

      {/* Sheet overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-2xl max-h-[70vh] flex flex-col"
            >
              {/* Handle */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>

              {/* Search */}
              <div className="px-4 pb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text" placeholder="搜索 API..."
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                    autoFocus
                  />
                </div>
              </div>

              {/* Tree */}
              <div className="flex-1 overflow-y-auto px-2 pb-4">
                {searchResults ? (
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-medium text-muted-foreground px-2 py-1">
                      搜索结果 ({searchResults.length})
                    </div>
                    {searchResults.map(entry => (
                      <button
                        key={entry.id}
                        onClick={() => { onSelectApi(entry.id); setIsOpen(false); }}
                        className={`w-full text-left px-2 py-1.5 rounded-md text-sm ${
                          selectedApi === entry.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50'
                        }`}
                      >
                        <span className="text-[10px] text-muted-foreground font-mono">{entry.moduleId}</span>{' '}
                        {entry.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  layers.map(layer => (
                    <div key={layer.id}>
                      <button
                        onClick={() => toggleLayer(layer.id)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium hover:bg-muted/30"
                      >
                        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${expandedLayers.has(layer.id) ? '' : '-rotate-90'}`} />
                        <span>{layer.name}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{layer.modules.reduce((s, m) => s + m.apis.length, 0)}</span>
                      </button>
                      {expandedLayers.has(layer.id) && layer.modules.map(mod => (
                        <div key={mod.id} className="ml-4">
                          <button
                            onClick={() => toggleModule(mod.id)}
                            className="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-xs hover:bg-muted/20"
                          >
                            <ChevronDown className={`w-2.5 h-2.5 text-muted-foreground transition-transform ${expandedModules.has(mod.id) ? '' : '-rotate-90'}`} />
                            <span className="text-muted-foreground">{mod.name}</span>
                            <span className="text-[10px] text-muted-foreground ml-auto">{mod.apis.length}</span>
                          </button>
                          {expandedModules.has(mod.id) && mod.apis.map(api => (
                            <button
                              key={api.id}
                              onClick={() => { onSelectApi(api.id); setIsOpen(false); }}
                              className={`w-full text-left pl-6 pr-2 py-1 rounded text-xs ${
                                selectedApi === api.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                              }`}
                            >
                              {api.name}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
