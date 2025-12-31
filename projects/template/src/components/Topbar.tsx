import { Bell, Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';

const Topbar = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const stats = await api.getDashboardStats();
      setUnreadCount(stats.unreadLetters);
    };
    fetchStats();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotification(false);
      }
    };

    if (showNotification) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotification]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-background/95 backdrop-blur-sm px-4 md:px-6 border-b border-border">
      {/* Search - Hidden on mobile */}
      <div className="hidden sm:flex items-center gap-4 flex-1">
        <div className="relative max-w-sm flex-1">
          <Search className={cn(
            "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200",
            searchFocused ? "text-primary" : "text-muted-foreground"
          )} />
          <input
            type="text"
            placeholder="Search..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full rounded-lg bg-muted py-2 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background transition-all duration-200"
          />
        </div>
      </div>

      {/* Mobile: Show logo */}
      <div className="flex sm:hidden items-center gap-2">
        <span className="font-display text-base font-semibold text-foreground">SantaCloud</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-3" ref={dropdownRef}>
        <span className="hidden lg:block text-sm text-muted-foreground">
          Welcome back, Santa
        </span>

        {/* Notifications */}
        <button 
          className={cn(
            "relative p-2 rounded-lg transition-all duration-200 press-effect",
            showNotification ? "bg-muted" : "hover:bg-muted"
          )}
          onClick={() => setShowNotification(!showNotification)}
        >
          <Bell className={cn(
            "h-4 w-4 transition-colors duration-200",
            showNotification ? "text-foreground" : "text-muted-foreground"
          )} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground animate-scale-in">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        {showNotification && (
          <div className="absolute right-4 md:right-6 top-12 w-64 rounded-lg bg-card shadow-lg border border-border p-3 animate-scale-in backdrop-blur-sm">
            <h3 className="font-medium text-sm text-foreground mb-2">Notifications</h3>
            <div className="space-y-1.5">
              <div className="p-2 rounded-md bg-muted text-xs text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer">
                {unreadCount} new letters awaiting reply
              </div>
              <div className="p-2 rounded-md bg-muted text-xs text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer">
                2 gifts ready for delivery
              </div>
            </div>
          </div>
        )}

        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-sm text-primary-foreground font-medium hover:ring-2 hover:ring-primary/30 hover:ring-offset-2 hover:ring-offset-background transition-all duration-200 cursor-pointer">
          🎅🏾
        </div>
      </div>
    </header>
  );
};

export default Topbar;
