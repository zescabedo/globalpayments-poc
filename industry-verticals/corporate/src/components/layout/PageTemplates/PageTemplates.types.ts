import { ComponentRendering, ComponentParams } from '@sitecore-jss/sitecore-jss-nextjs';
import { ReactNode } from 'react';

// Update PageTemplatesProps to include columns
export interface PageTemplatesProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  placeholders: Record<string, ReactNode>;
  className?: string;
  columns?: number; // Add columns as an optional property
}
