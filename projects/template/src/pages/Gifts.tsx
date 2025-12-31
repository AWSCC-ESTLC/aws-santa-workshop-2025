import { useEffect, useState } from 'react';
import { Gift as GiftIcon, Package, CheckCircle, Truck, Wrench, ChevronRight } from 'lucide-react';
import { api, Gift } from '@/services/api';
import PageTransition from '@/components/PageTransition';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const Gifts = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const fetchGifts = async () => {
    setIsLoading(true);
    const data = await api.getGifts();
    setGifts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchGifts();
  }, []);

  const getProgressPercentage = (status: Gift['status']): number => {
    const statusProgress = {
      manufacturing: 25,
      wrapping: 50,
      ready: 75,
      delivered: 100,
    };
    return statusProgress[status];
  };

  const statusConfig = {
    manufacturing: { icon: Wrench, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' },
    wrapping: { icon: Package, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
    ready: { icon: CheckCircle, color: 'text-nice', bg: 'bg-nice/10', border: 'border-nice/20' },
    delivered: { icon: Truck, color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/20' },
  };

  const statusCounts = {
    manufacturing: gifts.filter(g => g.status === 'manufacturing').length,
    wrapping: gifts.filter(g => g.status === 'wrapping').length,
    ready: gifts.filter(g => g.status === 'ready').length,
    delivered: gifts.filter(g => g.status === 'delivered').length,
  };

  const statusOrder: Gift['status'][] = ['manufacturing', 'wrapping', 'ready', 'delivered'];
  
  const getNextStatus = (currentStatus: Gift['status']): Gift['status'] | null => {
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex < statusOrder.length - 1) {
      return statusOrder[currentIndex + 1];
    }
    return null;
  };

  const handleUpdateStatus = async (gift: Gift, newStatus: Gift['status']) => {
    setIsUpdating(true);
    try {
      const updated = await api.updateGiftStatus(gift.id, newStatus);
      if (updated) {
        setGifts(prev => prev.map(g => g.id === gift.id ? { ...g, status: newStatus } : g));
        setSelectedGift(prev => prev?.id === gift.id ? { ...prev, status: newStatus } : prev);
        toast({
          title: "🎁 Gift Updated!",
          description: `${gift.giftName} is now ${newStatus}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update gift status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-6 w-32" />
        <div className="grid gap-2 md:gap-3 grid-cols-2 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-lg" />
          ))}
        </div>
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-36 rounded-xl" />
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
          <h1 className="text-lg md:text-xl font-semibold text-foreground">Gift Tracker</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            {gifts.length} gifts in production
          </p>
        </div>

        {/* Status Summary - 2x2 on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {Object.entries(statusConfig).map(([status, config], index) => {
            const Icon = config.icon;
            const count = statusCounts[status as keyof typeof statusCounts];
            return (
              <div 
                key={status}
                className={cn(
                  "rounded-lg p-3 md:p-4 border animate-fade-in hover-lift cursor-pointer",
                  config.bg,
                  config.border
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", config.color)} />
                  <span className={cn("text-lg md:text-xl font-semibold", config.color)}>{count}</span>
                </div>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1 capitalize">{status}</p>
              </div>
            );
          })}
        </div>

        {/* Gift Cards - Single column on mobile */}
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {gifts.map((gift, index) => {
            const config = statusConfig[gift.status];
            const nextStatus = getNextStatus(gift.status);
            return (
              <div 
                key={gift.id} 
                className="rounded-xl bg-card border border-border p-4 animate-fade-in hover-lift cursor-pointer"
                style={{ animationDelay: `${(index + 4) * 40}ms` }}
                onClick={() => setSelectedGift(gift)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center text-base">
                      🎁
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground">{gift.giftName}</h3>
                      <p className="text-xs text-muted-foreground">For {gift.childName}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded uppercase",
                    config.bg,
                    config.color
                  )}>
                    {gift.status}
                  </span>
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{getProgressPercentage(gift.status)}%</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-700 progress-animate"
                      style={{ 
                        width: `${getProgressPercentage(gift.status)}%`,
                        backgroundColor: 'hsl(var(--primary))'
                      }}
                    />
                  </div>
                </div>

                {/* Steps */}
                <div className="flex justify-between mt-3 pt-3 border-t border-border">
                  {['Manu', 'Wrap', 'Ready', 'Sent'].map((step, i) => {
                    const stepProgress = (i + 1) * 25;
                    const currentProgress = getProgressPercentage(gift.status);
                    const isCompleted = currentProgress >= stepProgress;
                    
                    return (
                      <div 
                        key={step}
                        className="flex flex-col items-center gap-1"
                      >
                        <div className={cn(
                          "h-2 w-2 rounded-full transition-all duration-300",
                          isCompleted ? 'bg-nice scale-110' : 'bg-muted'
                        )} />
                        <span className="text-[9px] text-muted-foreground">{step}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Priority + Update Button */}
                <div className="mt-3 flex items-center justify-between">
                  <span className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded",
                    gift.priority === 'high' 
                      ? 'bg-primary/10 text-primary' 
                      : gift.priority === 'medium'
                      ? 'bg-accent/10 text-accent'
                      : 'bg-muted text-muted-foreground'
                  )}>
                    {gift.priority} priority
                  </span>
                  {nextStatus && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px] text-primary press-effect"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(gift, nextStatus);
                      }}
                      disabled={isUpdating}
                    >
                      → {nextStatus}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Gift Detail Modal */}
        <Dialog open={!!selectedGift} onOpenChange={() => setSelectedGift(null)}>
          <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center text-2xl">
                  🎁
                </div>
                <div>
                  <span className="text-foreground">{selectedGift?.giftName}</span>
                  <p className="text-sm font-normal text-muted-foreground mt-0.5">
                    For {selectedGift?.childName}
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            {selectedGift && (
              <div className="space-y-4 mt-2">
                {/* Current Status */}
                <div className={cn(
                  "rounded-lg p-4 border",
                  statusConfig[selectedGift.status].bg,
                  statusConfig[selectedGift.status].border
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    {(() => {
                      const Icon = statusConfig[selectedGift.status].icon;
                      return <Icon className={cn("h-5 w-5", statusConfig[selectedGift.status].color)} />;
                    })()}
                    <span className={cn("font-medium capitalize", statusConfig[selectedGift.status].color)}>
                      {selectedGift.status}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-background/50 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-700"
                      style={{ 
                        width: `${getProgressPercentage(selectedGift.status)}%`,
                        backgroundColor: 'hsl(var(--primary))'
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Progress: {getProgressPercentage(selectedGift.status)}%
                  </p>
                </div>

                {/* Progress Steps */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Update Progress</p>
                  <div className="grid grid-cols-2 gap-2">
                    {statusOrder.map((status) => {
                      const config = statusConfig[status];
                      const Icon = config.icon;
                      const isActive = selectedGift.status === status;
                      const isPast = statusOrder.indexOf(selectedGift.status) > statusOrder.indexOf(status);
                      
                      return (
                        <button
                          key={status}
                          onClick={() => handleUpdateStatus(selectedGift, status)}
                          disabled={isUpdating || isActive}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-lg border transition-all press-effect",
                            isActive 
                              ? `${config.bg} ${config.border}` 
                              : isPast
                              ? "bg-nice/5 border-nice/20"
                              : "bg-muted/50 border-border hover:border-primary/30",
                            isActive && "ring-2 ring-offset-2 ring-offset-background",
                            isActive ? "ring-primary/50" : ""
                          )}
                        >
                          <Icon className={cn(
                            "h-4 w-4",
                            isActive ? config.color : isPast ? "text-nice" : "text-muted-foreground"
                          )} />
                          <span className={cn(
                            "text-xs font-medium capitalize",
                            isActive ? config.color : isPast ? "text-nice" : "text-muted-foreground"
                          )}>
                            {status}
                          </span>
                          {isPast && <CheckCircle className="h-3 w-3 text-nice ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Priority */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground">Priority</span>
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded capitalize",
                    selectedGift.priority === 'high' 
                      ? 'bg-primary/10 text-primary' 
                      : selectedGift.priority === 'medium'
                      ? 'bg-accent/10 text-accent'
                      : 'bg-muted text-muted-foreground'
                  )}>
                    {selectedGift.priority}
                  </span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default Gifts;
