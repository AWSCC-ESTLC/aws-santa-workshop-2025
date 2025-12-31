import { cn } from '@/lib/utils';

interface BadgeProps {
  variant: 'nice' | 'naughty' | 'default' | 'gold';
  children: React.ReactNode;
  className?: string;
}

const Badge = ({ variant, children, className }: BadgeProps) => {
  const variants = {
    nice: 'bg-nice/10 text-nice border-nice/20',
    naughty: 'bg-naughty/10 text-naughty border-naughty/20',
    default: 'bg-muted text-muted-foreground border-border',
    gold: 'bg-accent/10 text-accent border-accent/20',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
