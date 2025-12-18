import React, { JSX, CSSProperties, useLayoutEffect, useRef } from 'react';
import { useScrollProgress } from 'src/hooks/useScrollProgress';

/**
 * Direction of the color reveal animation
 */
export type ScrollRevealDirection = 'left-to-right' | 'top-to-bottom';

/**
 * Props for ScrollRevealText component
 */
export interface ScrollRevealTextProps {
  /**
   * Text content to reveal (can be string or React nodes)
   */
  children: React.ReactNode;
  
  /**
   * Starting color (unrevealed state)
   * @default '#D3D3D3'
   */
  startColor?: string;
  
  /**
   * Ending color (revealed state)
   * @default '#2729FF'
   */
  endColor?: string;
  
  /**
   * Animation direction
   * @default 'left-to-right'
   */
  direction?: ScrollRevealDirection;
  
  /**
   * Additional CSS classes (for typography only, not layout)
   */
  className?: string;
  
  /**
   * HTML element to render
   * @default 'span' (inline element to preserve layout)
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div' | 'span';
  
  /**
   * Viewport position where animation starts (0-1)
   * @default 0.8
   */
  startThreshold?: number;
  
  /**
   * Viewport position where animation completes (0-1)
   * @default 0.2
   */
  endThreshold?: number;
  
  /**
   * If true, animation only runs once
   * @default false
   */
  once?: boolean;
  
  /**
   * Smoothing factor for progress changes (0-1)
   * @default 0
   */
  smoothing?: number;
}

/**
 * A layout-neutral component that progressively reveals text color as the user scrolls.
 * 
 * **CRITICAL**: This component is designed to be completely invisible to the layout system.
 * It only applies text color effects and does NOT affect:
 * - Container width or height
 * - Padding or margins
 * - Text wrapping or line breaks
 * - Grid or flexbox behavior
 * - Any parent/sibling layout
 * 
 * Uses CSS background-clip: text with a gradient that adjusts based on scroll position.
 * The text starts in one color and fills with another color as you scroll down.
 * 
 * @example Basic usage within Bootstrap grid
 * ```tsx
 * <div className="container">
 *   <div className="row">
 *     <div className="col-lg-8">
 *       <h2 className="display-lg">
 *         <ScrollRevealText>
 *           Stay ahead in the fast-paced world of commerce
 *         </ScrollRevealText>
 *       </h2>
 *     </div>
 *   </div>
 * </div>
 * ```
 * 
 * @example With Sitecore Text field
 * ```tsx
 * <ScrollRevealText as="h1" className="display-xl">
 *   <Text field={props.fields.Title} />
 * </ScrollRevealText>
 * ```
 * 
 * @example Custom colors and thresholds
 * ```tsx
 * <ScrollRevealText
 *   startColor="#999999"
 *   endColor="#FF6B35"
 *   startThreshold={0.7}
 *   endThreshold={0.3}
 *   once={true}
 * >
 *   Custom reveal text
 * </ScrollRevealText>
 * ```
 */
export const ScrollRevealText = ({
  children,
  startColor = '#D3D3D3',
  endColor = '#2729FF',
  direction = 'left-to-right',
  className = '',
  as: Component = 'span',
  startThreshold = 0.8,
  endThreshold = 0.2,
  once = false,
  smoothing = 0,
}: ScrollRevealTextProps): JSX.Element => {
  // Track scroll progress
  const { elementRef, progress } = useScrollProgress({
    startThreshold,
    endThreshold,
    once,
    smoothing,
  });

  // Additional ref for direct DOM manipulation (needed for webkit properties)
  const domRef = useRef<HTMLElement>(null);

  // Check for background-clip support
  const supportsBackgroundClip = typeof document !== 'undefined' && 
    ('webkitBackgroundClip' in document.documentElement.style || 
     'backgroundClip' in document.documentElement.style);

  // Convert progress (0-1) to percentage for gradient
  const progressPercent = progress * 100;
  
  // Determine gradient direction
  const gradientDirection = direction === 'left-to-right' ? 'to right' : 'to bottom';
  
  // Build gradient:
  // From 0% to progress%: use endColor (revealed/filled)
  // From progress% to 100%: use startColor (unrevealed)
  const gradient = `linear-gradient(
    ${gradientDirection},
    ${endColor} 0%,
    ${endColor} ${progressPercent}%,
    ${startColor} ${progressPercent}%,
    ${startColor} 100%
  )`;
  
  /**
   * CRITICAL FIX: React doesn't reliably render webkit properties through the style prop
   * We must use useLayoutEffect to directly manipulate the DOM
   * This ensures -webkit-background-clip and -webkit-text-fill-color are actually applied
   */
  useLayoutEffect(() => {
    // Only apply webkit styles if browser supports it
    if (!supportsBackgroundClip) return;

    const element = domRef.current || elementRef.current;
    if (!element) return;

    // Directly set webkit/moz properties on the DOM element
    // Using CSSStyleDeclaration interface instead of 'any'
    const elementStyle = element.style;
    elementStyle.setProperty('background', gradient);
    elementStyle.setProperty('background-size', '100% 100%');
    elementStyle.setProperty('background-repeat', 'no-repeat');
    elementStyle.setProperty('-webkit-background-clip', 'text');
    elementStyle.setProperty('background-clip', 'text');
    elementStyle.setProperty('-moz-background-clip', 'text');
    elementStyle.setProperty('-webkit-text-fill-color', 'transparent');
    elementStyle.setProperty('-moz-text-fill-color', 'transparent');
    elementStyle.setProperty('color', 'transparent');
    elementStyle.setProperty('background-color', 'transparent');
    elementStyle.setProperty('box-shadow', 'none');
    elementStyle.setProperty('border', 'none');
    elementStyle.setProperty('padding', '0');
    elementStyle.setProperty('margin', '0');
    elementStyle.setProperty('position', 'relative');
    elementStyle.setProperty('opacity', '1');
    elementStyle.setProperty('visibility', 'visible');
    elementStyle.setProperty('will-change', 'background');
    elementStyle.setProperty('display', 'inline');
  }, [gradient, elementRef, supportsBackgroundClip]);
  
  /**
   * Basic styles that React can handle
   * The critical webkit properties are applied via useLayoutEffect above
   */
  const style: CSSProperties = supportsBackgroundClip 
    ? { display: 'inline' } 
    : { color: endColor };
  
  return (
    <Component 
      ref={(el: HTMLElement | null) => {
        // Set both refs - properly typed callback ref
        if (elementRef) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (elementRef as React.MutableRefObject<HTMLElement | null>).current = el;
        }
        domRef.current = el;
      }}
      style={style}
      className={`scroll-reveal-text ${className}`}
    >
      {children}
    </Component>
  );
};

export default ScrollRevealText;
