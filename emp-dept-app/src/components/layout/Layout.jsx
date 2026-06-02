import { Outlet } from 'react-router';
import { Toaster } from 'react-hot-toast';
import NavBar from './NavBar';

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <NavBar />
      <main className="max-w-5xl mx-auto p-6">
        <Outlet />
      </main>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </div>
  );
}

export default Layout;
