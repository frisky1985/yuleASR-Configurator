import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import { Layout } from './components/Layout';
import { ThemeProvider } from './components/ThemeProvider';
import { BrandProvider } from './contexts/BrandContext';
import { AdminBranding } from './pages/AdminBranding';
import { Compare } from './pages/Compare';
import { ConfigDiff } from './pages/ConfigDiff';
import { Dashboard } from './pages/Dashboard';
import { Editor } from './pages/Editor';
import { GitSync } from './pages/GitSync';
import { LicenseActivation } from './pages/LicenseActivation';
import { Login } from './pages/Login';
import { Migrate } from './pages/Migrate';
import { Register } from './pages/Register';
import { Settings } from './pages/Settings';
import { Templates } from './pages/Templates';
import { useAuthStore } from './stores/authStore';

const PluginManager = lazy(() => import('./pages/PluginManager'));

import './styles/branding.css';

function App() {
  const loadFromStorage = useAuthStore(s => s.loadFromStorage);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <ThemeProvider>
      <BrandProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/sync" element={<GitSync />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/license" element={<LicenseActivation />} />
            <Route
              path="/plugins"
              element={
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-20 text-muted-foreground">
                      加载插件管理...
                    </div>
                  }
                >
                  <PluginManager />
                </Suspense>
              }
            />
            <Route path="/migrate" element={<Migrate />} />
            <Route path="/editor/:configId" element={<Editor />} />
            <Route path="/editor/:configId/:moduleId" element={<Editor />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/compare/:configAId" element={<Compare />} />
            <Route path="/compare/:configAId/:configBId" element={<Compare />} />
            <Route path="/diff" element={<ConfigDiff />} />
            <Route path="/diff/:configAId" element={<ConfigDiff />} />
            <Route path="/diff/:configAId/:configBId" element={<ConfigDiff />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/branding" element={<AdminBranding />} />
          </Routes>
        </Layout>
      </BrandProvider>
    </ThemeProvider>
  );
}

export default App;
