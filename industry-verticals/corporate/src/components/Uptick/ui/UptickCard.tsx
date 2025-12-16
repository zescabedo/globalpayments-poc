import React from 'react';
import { cn } from '@/lib/utils/class-utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div className={cn('gpn-card', className)} {...props}>
      {children}
    </div>
  );
};

export const CardContent = ({ children, className, ...props }: CardContentProps) => {
  return (
    <div className={cn('card-content', className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }: CardContentProps) => {
  return (
    <div className={cn('p-6 pb-0', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className, ...props }: CardContentProps) => {
  return (
    <div className={cn('p-6 pt-0 flex items-center', className)} {...props}>
      {children}
    </div>
  );
};
