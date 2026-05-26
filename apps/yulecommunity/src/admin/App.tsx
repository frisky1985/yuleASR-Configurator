import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { adminRoutes } from './routes';
import { useAdminStore } from './stores/adminStore';

const App: React.FC = () => {
  const { setLoading } = useAdminStore();

  useEffect(() => {
    // Initialize admin state
    setLoading(false);
  }, [setLoading]);

  return <RouterProvider router={adminRoutes} />;
};

export default App;
