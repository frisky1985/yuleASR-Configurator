import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { UserDetail } from './pages/UserDetail';
import { Builds } from './pages/Builds';
import { BuildDetail } from './pages/BuildDetail';
import { Settings } from './pages/Settings';
import { useAdminStore } from './stores/adminStore';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, checkAdminAccess } = useAdminStore.getState();
  
  if (!isAuthenticated || !checkAdminAccess()) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

export const adminRoutes = createBrowserRouter([
  {
    path: '/admin/login',
    element: <Login />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'users',
        element: <Users />,
      },
      {
        path: 'users/:id',
        element: <UserDetail />,
      },
      {
        path: 'builds',
        element: <Builds />,
      },
      {
        path: 'builds/:id',
        element: <BuildDetail />,
      },
      {
        path: 'content',
        element: <div>Content Management (Coming Soon)</div>,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
]);
