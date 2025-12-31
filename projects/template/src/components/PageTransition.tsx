import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const PageTransition = ({ children, className }: PageTransitionProps) => {
  return (
    <div className={cn("animate-page-in", className)}>
      {children}
    </div>
  );
};

export default PageTransition;
