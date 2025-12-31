import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Gift, 
  CircleDot,
  Mail,
  Snowflake
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Children', href: '/children', icon: Users },
  { name: 'Gifts', href: '/gifts', icon: Gift },
  { name: 'Reindeers', href: '/reindeers', icon: CircleDot },
  { name: 'Letters', href: '/letters', icon: Mail },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 bg-sidebar transition-all duration-300 ease-out border-r border-sidebar-border hidden md:flex md:flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Snowflake className="h-5 w-5 text-sidebar-foreground" />
          <span className="font-display text-base font-semibold text-sidebar-foreground">
            SantaCloud
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {navigation.map((item, index) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 press-effect",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <item.icon className={cn(
                "h-4 w-4 flex-shrink-0 transition-transform duration-200",
                isActive && "scale-110"
              )} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2 text-xs text-sidebar-foreground/50">
          <span>✨</span>
          <span>Ready for Christmas</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
