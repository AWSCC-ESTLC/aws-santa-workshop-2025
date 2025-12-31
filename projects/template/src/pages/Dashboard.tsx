import { useEffect, useState } from 'react';
import { Users, Gift, CircleDot, Mail } from 'lucide-react';
import { api, DashboardStats } from '@/services/api';
import StatsCard from '@/components/StatsCard';
import ChristmasCountdown from '@/components/ChristmasCountdown';
import PageTransition from '@/components/PageTransition';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [giftProgress, setGiftProgress] = useState<{ label: string; value: number; color: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [dashStats, progress] = await Promise.all([
        api.getDashboardStats(),
        api.getGiftProgressStats(),
      ]);
      setStats(dashStats);
      setGiftProgress(progress);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-6 w-32" />
        <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const totalGifts = giftProgress.reduce((acc, item) => acc + item.value, 0);

  return (
    <PageTransition>
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Overview of your Christmas operations
          </p>
        </div>

        {/* Stats Grid - 2x2 on mobile, 4 columns on desktop */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Children"
            value={stats.totalChildren.toLocaleString()}
            icon={Users}
            trend={{ value: 12, positive: true }}
            variant="primary"
            delay={0}
          />
          <StatsCard
            title="Nice Children"
            value={stats.niceChildren.toLocaleString()}
            icon={Users}
            trend={{ value: 8, positive: true }}
            variant="secondary"
            delay={50}
          />
          <StatsCard
            title="Gifts Ready"
            value={stats.giftsReady.toLocaleString()}
            icon={Gift}
            variant="accent"
            delay={100}
          />
          <StatsCard
            title="Active Reindeers"
            value={stats.activeReindeers}
            icon={CircleDot}
            variant="default"
            delay={150}
          />
        </div>

        {/* Content Grid */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
          {/* Gift Progress */}
          <div className="lg:col-span-2 rounded-xl bg-card border border-border p-4 md:p-5 animate-fade-in hover-lift" style={{ animationDelay: '200ms' }}>
            <h3 className="text-sm font-medium text-foreground mb-4">Gift Production</h3>
            <div className="space-y-3">
              {giftProgress.map((item, index) => (
                <div key={item.label} className="space-y-1.5 animate-slide-up" style={{ animationDelay: `${250 + index * 50}ms` }}>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-700 progress-animate"
                      style={{ 
                        width: `${(item.value / totalGifts) * 100}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="rounded-xl bg-card border border-border p-4 md:p-5 animate-fade-in hover-lift" style={{ animationDelay: '250ms' }}>
            <h3 className="text-sm font-medium text-foreground mb-4">Alerts</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-naughty/5 border border-naughty/10 transition-all duration-200 hover:bg-naughty/10 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-naughty" />
                  <span className="text-sm text-foreground">Naughty list</span>
                </div>
                <span className="text-sm font-semibold text-naughty">{stats.naughtyChildren}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/5 border border-accent/10 transition-all duration-200 hover:bg-accent/10 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-accent" />
                  <span className="text-sm text-foreground">In progress</span>
                </div>
                <span className="text-sm font-semibold text-accent">{stats.giftsInProgress}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10 transition-all duration-200 hover:bg-primary/10 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-sm text-foreground">Unread letters</span>
                </div>
                <span className="text-sm font-semibold text-primary">{stats.unreadLetters}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Christmas Countdown */}
        <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <ChristmasCountdown />
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
