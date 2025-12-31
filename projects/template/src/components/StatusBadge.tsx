import { cn } from '@/lib/utils';

type Status = 'manufacturing' | 'wrapping' | 'ready' | 'delivered' | 'resting' | 'training' | 'flying';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const statusConfig = {
    manufacturing: { label: '🔧 Manufacturing', color: 'bg-accent/10 text-accent border-accent/20' },
    wrapping: { label: '🎀 Wrapping', color: 'bg-primary/10 text-primary border-primary/20' },
    ready: { label: '✅ Ready', color: 'bg-nice/10 text-nice border-nice/20' },
    delivered: { label: '🚀 Delivered', color: 'bg-secondary/20 text-secondary border-secondary/30' },
    resting: { label: '😴 Resting', color: 'bg-muted text-muted-foreground border-border' },
    training: { label: '🏃 Training', color: 'bg-accent/10 text-accent border-accent/20' },
    flying: { label: '✈️ Flying', color: 'bg-nice/10 text-nice border-nice/20' },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold",
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
