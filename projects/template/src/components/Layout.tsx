import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';
import { AuroraBackground } from './AuroraBackground';

const Layout = () => {
  return (
    <div className="min-h-screen relative">
      <AuroraBackground />
      
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="md:pl-56 transition-all duration-300">
        <Topbar />
        <main className="relative p-4 md:p-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};

export default Layout;
