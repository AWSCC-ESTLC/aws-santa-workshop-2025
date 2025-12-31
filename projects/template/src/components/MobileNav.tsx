import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Gift, CircleDot, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/', icon: LayoutDashboard },
  { name: 'Children', href: '/children', icon: Users },
  { name: 'Gifts', href: '/gifts', icon: Gift },
  { name: 'Reindeers', href: '/reindeers', icon: CircleDot },
  { name: 'Letters', href: '/letters', icon: Mail },
];

const MobileNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[4rem]",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground active:scale-95"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-transform duration-200",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-[10px] font-medium transition-all duration-200",
                isActive ? "opacity-100" : "opacity-70"
              )}>
                {item.name}
              </span>
              {isActive && (
                <span className="absolute -bottom-0 h-0.5 w-8 bg-primary rounded-full" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
