import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  delay?: number;
}

const StatsCard = ({ title, value, icon: Icon, trend, variant = 'default', delay = 0 }: StatsCardProps) => {
  const variants = {
    default: 'bg-card border-border',
    primary: 'bg-primary text-primary-foreground border-primary',
    secondary: 'bg-secondary text-secondary-foreground border-secondary',
    accent: 'bg-accent/10 border-accent/20',
  };

  const iconVariants = {
    default: 'text-muted-foreground group-hover:text-foreground',
    primary: 'text-primary-foreground/80 group-hover:text-primary-foreground',
    secondary: 'text-secondary-foreground/80 group-hover:text-secondary-foreground',
    accent: 'text-accent group-hover:scale-110',
  };

  const isColoredVariant = variant !== 'default' && variant !== 'accent';

  return (
    <div 
      className={cn(
        "relative rounded-xl border p-4 md:p-5 animate-fade-in hover-lift group cursor-default",
        variants[variant]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            "text-[10px] md:text-xs font-medium uppercase tracking-wide",
            isColoredVariant ? 'opacity-80' : 'text-muted-foreground'
          )}>
            {title}
          </p>
          <p className="mt-1.5 md:mt-2 text-xl md:text-2xl font-semibold tracking-tight">
            {value}
          </p>
          {trend && (
            <p className={cn(
              "mt-1 text-[10px] md:text-xs font-medium",
              trend.positive ? 'text-nice' : 'text-naughty',
              isColoredVariant && 'opacity-90'
            )}>
              {trend.positive ? '↑' : '↓'} {trend.value}%
            </p>
          )}
        </div>
        <Icon className={cn(
          "h-4 w-4 md:h-5 md:w-5 transition-all duration-200",
          iconVariants[variant]
        )} />
      </div>
    </div>
  );
};

export default StatsCard;
