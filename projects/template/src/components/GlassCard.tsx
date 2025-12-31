import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  delay?: number;
}

export function GlassCard({ 
  children, 
  className, 
  hover = true, 
  glow = false,
  delay = 0 
}: GlassCardProps) {
  return (
    <div 
      className={cn(
        "glass-card p-6 fade-in-up",
        hover && "hover-glow cursor-pointer",
        glow && "pulse-glow",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
