import { useEffect, useState } from 'react';
import { MapPin, Battery, Zap } from 'lucide-react';
import { api, Reindeer } from '@/services/api';
import PageTransition from '@/components/PageTransition';
import { cn } from '@/lib/utils';

const Reindeers = () => {
  const [reindeers, setReindeers] = useState<Reindeer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReindeers = async () => {
      setIsLoading(true);
      const data = await api.getReindeers();
      setReindeers(data);
      setIsLoading(false);
    };
    fetchReindeers();
  }, []);

  const statusCounts = {
    resting: reindeers.filter(r => r.status === 'resting').length,
    training: reindeers.filter(r => r.status === 'training').length,
    flying: reindeers.filter(r => r.status === 'flying').length,
  };

  const statusConfig = {
    resting: { color: 'text-muted-foreground', bg: 'bg-muted', label: 'Resting' },
    training: { color: 'text-accent', bg: 'bg-accent/10', label: 'Training' },
    flying: { color: 'text-nice', bg: 'bg-nice/10', label: 'Flying' },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-6 w-40" />
        <div className="skeleton h-40 md:h-48 rounded-xl" />
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-foreground">Reindeer Fleet</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            {reindeers.length} reindeers in the team
          </p>
        </div>

        {/* Map Placeholder */}
        <div className="relative rounded-xl bg-secondary overflow-hidden h-40 md:h-48 animate-fade-in">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-secondary-foreground">
              <div className="text-3xl md:text-4xl mb-2">🗺️</div>
              <h3 className="text-sm font-medium">North Pole Operations</h3>
              <p className="text-xs opacity-70 mt-0.5">Real-time tracking</p>
            </div>
          </div>
          
          {/* Flying indicators */}
          {reindeers.filter(r => r.status === 'flying').map((_, i) => (
            <div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-nice animate-pulse-soft"
              style={{
                top: `${35 + i * 12}%`,
                left: `${45 + i * 8}%`,
              }}
            />
          ))}
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {Object.entries(statusConfig).map(([status, config], index) => (
            <div 
              key={status}
              className={cn(
                "rounded-lg p-3 md:p-4 text-center hover-lift animate-fade-in",
                config.bg
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <p className={cn("text-lg md:text-xl font-semibold", config.color)}>
                {statusCounts[status as keyof typeof statusCounts]}
              </p>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{config.label}</p>
            </div>
          ))}
        </div>

        {/* Reindeer Cards - Full width on mobile */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {reindeers.map((reindeer, index) => {
            const config = statusConfig[reindeer.status];
            const isLeader = reindeer.name === 'Rudolph';
            
            return (
              <div 
                key={reindeer.id} 
                className={cn(
                  "rounded-xl bg-card border p-4 animate-fade-in hover-lift",
                  isLeader ? 'border-primary' : 'border-border'
                )}
                style={{ animationDelay: `${(index + 3) * 30}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "h-9 w-9 rounded-lg flex items-center justify-center text-lg transition-transform duration-200",
                      isLeader ? 'bg-primary/10' : 'bg-secondary/10'
                    )}>
                      {isLeader ? '🔴' : '🦌'}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        {reindeer.name}
                        {isLeader && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            Leader
                          </span>
                        )}
                      </h3>
                      <span className={cn("text-[10px] font-medium", config.color)}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                  {reindeer.status === 'flying' && (
                    <Zap className="h-4 w-4 text-nice animate-pulse-soft" />
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                  <MapPin className="h-3 w-3" />
                  <span>{reindeer.location}</span>
                </div>

                {/* Energy Level */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Battery className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Energy</span>
                    </div>
                    <span className={cn(
                      "font-medium",
                      reindeer.energyLevel >= 80 ? 'text-nice' : 
                      reindeer.energyLevel >= 50 ? 'text-accent' : 'text-naughty'
                    )}>
                      {reindeer.energyLevel}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${reindeer.energyLevel}%`,
                        backgroundColor: reindeer.energyLevel >= 80 
                          ? 'hsl(var(--nice))' 
                          : reindeer.energyLevel >= 50 
                          ? 'hsl(var(--accent))' 
                          : 'hsl(var(--naughty))'
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
};

export default Reindeers;
