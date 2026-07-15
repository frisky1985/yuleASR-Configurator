import { useMemo, type ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { GitCompare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DevHubLayout } from '../../components/autosar/DevHubLayout';
import { SpecTreeNav } from '../../components/autosar/SpecTreeNav';
import { SpecSheetNav } from '../../components/autosar/SpecSheetNav';
import { ApiCard } from '../../components/autosar/ApiCard';
import { EmptyApiCard } from '../../components/autosar/EmptyApiCard';
import { findApiById, findModuleById, SPEC_VERSIONS } from '../../data/autosar/spec-index';

export function SpecBrowserPage() {
  const { module: moduleParam, api: apiParam } = useParams();
  const navigate = useNavigate();

  const selectedApi = useMemo(() => {
    if (apiParam) return findApiById(apiParam);
    if (moduleParam) {
      const mod = findModuleById(moduleParam);
      if (mod && mod.apis.length > 0) return mod.apis[0];
    }
    return null;
  }, [moduleParam, apiParam]);

  const handleSelectApi = (apiId: string) => {
    const api = findApiById(apiId);
    if (api) {
      navigate(`/autosar/spec/${api.moduleId}/${api.id}`);
    }
  };

  const headerExtra: ReactNode = (
    <>
      <Link
        to="/autosar/spec/compare"
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/30"
      >
        <GitCompare className="w-3.5 h-3.5" />
        版本对比
      </Link>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">版本:</span>
        <select className="text-xs px-2 py-1 rounded-md bg-background border border-border">
          {SPEC_VERSIONS.map(v => (
            <option key={v.id} value={v.id}>{v.label}</option>
          ))}
        </select>
      </div>
    </>
  );

  return (
    <DevHubLayout title="规范引擎" backTo="/autosar" headerExtra={headerExtra}>
      <Helmet>
        <title>{selectedApi ? `${selectedApi.name} - AutoSAR 规范` : 'AutoSAR 规范引擎'} - YuleTech</title>
      </Helmet>

      {/* Mobile selector - visible only on small screens */}
      <div className="md:hidden px-4 py-3 border-b border-border bg-muted/5">
        <SpecSheetNav selectedApi={selectedApi?.id || null} onSelectApi={handleSelectApi} />
      </div>

      {/* Sidebar + detail */}
      <div className="flex" style={{ height: 'calc(100vh - 8.5rem)' }}>
        {/* Left sidebar - Tree */}
        <div className="w-[240px] shrink-0 border-r border-border bg-muted/5 overflow-hidden hidden md:block">
          <SpecTreeNav
            selectedApi={selectedApi?.id || null}
            onSelectApi={handleSelectApi}
          />
        </div>

        {/* Right - Detail */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-6">
            {selectedApi ? (
              <ApiCard api={selectedApi} />
            ) : (
              <EmptyApiCard />
            )}
          </div>
        </div>
      </div>
    </DevHubLayout>
  );
}
