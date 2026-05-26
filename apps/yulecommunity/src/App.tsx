import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PageLoader } from './components/PageLoader';
import { InteractiveCLI } from './components/InteractiveCLI';
import { useHotkeys } from './hooks/useHotkeys';
import { HotkeyHelp } from './components/HotkeyHelp';
import { useAdminStore } from './admin/stores/adminStore';

// 使用 LazyEngagement 实现组件级代码分割
const LazyEngagement = lazy(() => import('./components/engagement/LazyEngagement').then(m => ({ default: m.LazyEngagement })));

// Main app pages
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const OpenSourcePage = lazy(() => import('./pages/OpenSourcePage').then(m => ({ default: m.OpenSourcePage })));
const ToolchainPage = lazy(() => import('./pages/ToolchainPage').then(m => ({ default: m.ToolchainPage })));
const LearningPage = lazy(() => import('./pages/LearningPage').then(m => ({ default: m.LearningPage })));
const CommunityPage = lazy(() => import('./pages/CommunityPage').then(m => ({ default: m.CommunityPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const BlogListPage = lazy(() => import('./pages/BlogListPage').then(m => ({ default: m.BlogListPage })));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage').then(m => ({ default: m.BlogDetailPage })));
const DocsPage = lazy(() => import('./pages/DocsPage').then(m => ({ default: m.DocsPage })));
const ForumPage = lazy(() => import('./pages/ForumPage').then(m => ({ default: m.ForumPage })));
const QAPage = lazy(() => import('./pages/QAPage').then(m => ({ default: m.QAPage })));
const EventsPage = lazy(() => import('./pages/EventsPage').then(m => ({ default: m.EventsPage })));
const HardwarePage = lazy(() => import('./pages/HardwarePage').then(m => ({ default: m.HardwarePage })));
const DownloadPage = lazy(() => import('./pages/DownloadPage').then(m => ({ default: m.DownloadPage })));
const ModuleDetailPage = lazy(() => import('./pages/ModuleDetailPage').then(m => ({ default: m.ModuleDetailPage })));
const ModuleComparePage = lazy(() => import('./pages/ModuleComparePage').then(m => ({ default: m.ModuleComparePage })));
const CodeSandboxPage = lazy(() => import('./pages/CodeSandboxPage').then(m => ({ default: m.CodeSandboxPage })));
const LearningPathsPage = lazy(() => import('./pages/LearningPathsPage').then(m => ({ default: m.LearningPathsPage })));
const QualityPage = lazy(() => import('./pages/QualityPage').then(m => ({ default: m.QualityPage })));
const OrganizationPage = lazy(() => import('./pages/OrganizationPage').then(m => ({ default: m.OrganizationPage })));
const WorkspacePage = lazy(() => import('./pages/WorkspacePage').then(m => ({ default: m.WorkspacePage })));
const SSOPage = lazy(() => import('./pages/SSOPage').then(m => ({ default: m.SSOPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage').then(m => ({ default: m.BookmarksPage })));
const YuleASRPage = lazy(() => import('./pages/YuleASRPage').then(m => ({ default: m.YuleASRPage })));
const YuleASREditorPage = lazy(() => import('./pages/YuleASREditorPage').then(m => ({ default: m.YuleASREditorPage })));

// Admin pages - New implementation
const AdminLogin = lazy(() => import('./admin/pages/Login').then(m => ({ default: m.Login })));
const AdminLayout = lazy(() => import('./admin/components/Layout').then(m => ({ default: m.Layout })));
const AdminDashboard = lazy(() => import('./admin/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const AdminUsers = lazy(() => import('./admin/pages/Users').then(m => ({ default: m.Users })));
const AdminBuilds = lazy(() => import('./admin/pages/Builds').then(m => ({ default: m.Builds })));
const AdminSettings = lazy(() => import('./admin/pages/Settings').then(m => ({ default: m.Settings })));

// Protected Route for Admin
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAdminStore.getState();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  const { showHelp, setShowHelp } = useHotkeys();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HotkeyHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <Routes>
        {/* Admin routes - New implementation */}
        <Route path="/admin/login" element={
          <Suspense fallback={<PageLoader />}>
            <AdminLogin />
          </Suspense>
        } />
        <Route path="/admin" element={
          <Suspense fallback={<PageLoader />}>
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          </Suspense>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={
            <Suspense fallback={<PageLoader />}>
              <AdminDashboard />
            </Suspense>
          } />
          <Route path="users" element={
            <Suspense fallback={<PageLoader />}>
              <AdminUsers />
            </Suspense>
          } />
          <Route path="users/:id" element={
            <Suspense fallback={<PageLoader />}>
              <div className="p-8 text-center">
                <h2 className="text-xl font-semibold mb-4">用户详情</h2>
                <p className="text-slate-500">开发中...</p>
              </div>
            </Suspense>
          } />
          <Route path="builds" element={
            <Suspense fallback={<PageLoader />}>
              <AdminBuilds />
            </Suspense>
          } />
          <Route path="builds/:id" element={
            <Suspense fallback={<PageLoader />}>
              <div className="p-8 text-center">
                <h2 className="text-xl font-semibold mb-4">构建详情</h2>
                <p className="text-slate-500">开发中...</p>
              </div>
            </Suspense>
          } />
          <Route path="content" element={
            <Suspense fallback={<PageLoader />}>
              <div className="p-8 text-center">
                <h2 className="text-xl font-semibold mb-4">内容管理</h2>
                <p className="text-slate-500">开发中...</p>
              </div>
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<PageLoader />}>
              <AdminSettings />
            </Suspense>
          } />
        </Route>

        {/* Public routes */}
        <Route path="*" element={
          <>
            <OfflineIndicator />
            <Navbar />
            <main>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route index element={<HomePage />} />
                  <Route path="opensource" element={<OpenSourcePage />} />
                  <Route path="opensource/:moduleId" element={<ModuleDetailPage />} />
                  <Route path="compare" element={<ModuleComparePage />} />
                  <Route path="sandbox" element={<CodeSandboxPage />} />
                  <Route path="learning-paths" element={<LearningPathsPage />} />
                  <Route path="quality" element={<QualityPage />} />
                  <Route path="organization" element={<OrganizationPage />} />
                  <Route path="workspace" element={<WorkspacePage />} />
                  <Route path="sso" element={<SSOPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="toolchain" element={<ToolchainPage />} />
                  <Route path="learning" element={<LearningPage />} />
                  <Route path="community" element={<CommunityPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="blog" element={<BlogListPage />} />
                  <Route path="blog/:slug" element={<BlogDetailPage />} />
                  <Route path="bookmarks" element={<BookmarksPage />} />
                  <Route path="docs" element={<DocsPage />} />
                  <Route path="forum" element={<ForumPage />} />
                  <Route path="qa" element={<QAPage />} />
                  <Route path="events" element={<EventsPage />} />
                  <Route path="hardware" element={<HardwarePage />} />
                  <Route path="downloads" element={<DownloadPage />} />
                  <Route path="yuleasr" element={<YuleASRPage />} />
                  <Route path="yuleasr/editor/:configId" element={<YuleASREditorPage />} />
                  <Route path="yuleasr/editor/:configId/:moduleId" element={<YuleASREditorPage />} />
                  <Route path="*" element={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold mb-4">404</h1>
                        <p className="text-muted-foreground mb-6">页面不存在</p>
                        <a href="#/" className="text-[hsl(var(--primary))] hover:underline">
                          返回首页
                        </a>
                      </div>
                    </div>
                  } />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <InteractiveCLI />
            
            {/* Phase 4: 组件级代码分割 - 使用 LazyEngagement 实现懒加载 */}
            <Suspense fallback={null}>
              <LazyEngagement 
                enableWechat={true}
                enableNewsletter={true}
                wechatPosition="bottom-right"
                wechatDelay={8000}
                newsletterDelay={15000}
                enableExitIntent={true}
              />
            </Suspense>
          </>
        } />
      </Routes>
    </div>
  );
}

export default App;
