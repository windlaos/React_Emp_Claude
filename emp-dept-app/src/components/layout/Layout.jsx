import { Outlet } from 'react-router';
import NavBar from './NavBar';

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-5xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
