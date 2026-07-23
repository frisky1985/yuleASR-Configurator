import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Search, Star } from 'lucide-react';
import { getLayers, buildSearchIndex, findApiById } from '../../data/autosar/spec-index';
import { useBookmarks } from '../../hooks/autosar/useBookmarks';

const layerColors: Record<string, string> = {
  MCAL: 'text-blue-500', ECUAL: 'text-cyan-500', Service: 'text-teal-500', RTE_ASW: 'text-emerald-500',
};

interface SpecTreeNavProps {
  selectedApi: string | null;
  onSelectApi: (apiId: string) => void;
}

export function SpecTreeNav({ selectedApi, onSelectApi }: SpecTreeNavProps) {
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set(['MCAL']));
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(['Can']));
  const [searchQuery, setSearchQuery] = useState('');

  const searchIndex = buildSearchIndex();
  const { bookmarks, isBookmarked } = useBookmarks();

  const toggleLayer = (layerId: string) => {
    setExpandedLayers(prev => {
      const next = new Set(prev);
      next.has(layerId) ? next.delete(layerId) : next.add(layerId);
      return next;
    });
  };

  const toggleModule = (modId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      next.has(modId) ? next.delete(modId) : next.add(modId);
      return next;
    });
  };

  // Filter logic
  const filteredLayers = getLayers()
    .map(layer => ({
      ...layer,
      modules: layer.modules.filter(m =>
        !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(l => !searchQuery || l.modules.length > 0);

  const searchResults = !searchQuery ? null : searchIndex.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.brief.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 20);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Search */}
      <div className="px-3 py-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索 API..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-muted/50 border border-border focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {searchQuery ? (
          /* Search Results */
          <div className="space-y-0.5">
            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">
              搜索结果 ({searchResults?.length || 0})
            </div>
            {searchResults?.map(entry => (
              <button
                key={entry.id}
                onClick={() => { onSelectApi(entry.id); setSearchQuery(''); }}
                className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2 ${
                  selectedApi === entry.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted/50 text-foreground'
                }`}
              >
                <span className="text-[10px] text-muted-foreground font-mono shrink-0">{entry.moduleId}</span>
                <span className="truncate">{entry.name}</span>
              </button>
            ))}
            {searchResults?.length === 0 && (
              <div className="text-xs text-muted-foreground text-center py-4">无匹配结果</div>
            )}
          </div>
        ) : (
          <>
            {/* Bookmarks Section */}
            {bookmarks.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-muted-foreground">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  收藏的 API ({bookmarks.length})
                </div>
                {bookmarks.map(apiId => {
                  const api = findApiById(apiId);
                  if (!api) return null;
                  return (
                    <button
                      key={apiId}
                      onClick={() => onSelectApi(apiId)}
                      className={`w-full text-left pl-4 pr-2 py-1 rounded text-[11px] transition-colors ${
                        selectedApi === apiId
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                      }`}
                    >
                      {api.name}
                    </button>
                  );
                })}
                <div className="border-t border-border my-1" />
              </div>
            )}

            {/* Layer Tree */}
            {filteredLayers.map(layer => (
              <div key={layer.id}>
                <button
                  onClick={() => toggleLayer(layer.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium hover:bg-muted/50 transition-colors"
                >
                  {expandedLayers.has(layer.id)
                    ? <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                    : <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                  }
                  <span className={layerColors[layer.id]}>{layer.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {layer.modules.reduce((s, m) => s + m.apis.length, 0)}
                  </span>
                </button>

                <AnimatePresence>
                  {expandedLayers.has(layer.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      {layer.modules.map(mod => (
                        <div key={mod.id} className="ml-3">
                          <button
                            onClick={() => toggleModule(mod.id)}
                            className="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-xs hover:bg-muted/30 transition-colors"
                          >
                            {expandedModules.has(mod.id)
                              ? <ChevronDown className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                              : <ChevronRight className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                            }
                            <span className="text-muted-foreground">{mod.name}</span>
                            <span className="text-[10px] text-muted-foreground ml-auto">{mod.apis.length}</span>
                          </button>

                          <AnimatePresence>
                            {expandedModules.has(mod.id) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                {mod.apis.map(api => (
                                  <button
                                    key={api.id}
                                    onClick={() => onSelectApi(api.id)}
                                    className={`w-full text-left pl-6 pr-2 py-1 rounded text-[11px] transition-colors flex items-center gap-1 ${
                                      selectedApi === api.id
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                                    }`}
                                  >
                                    {api.name}
                                    {isBookmarked(api.id) && <Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500 shrink-0 ml-auto" />}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
