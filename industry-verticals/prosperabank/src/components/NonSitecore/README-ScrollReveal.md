# ScrollRevealText Component

A reusable React component that creates a scroll-triggered text color reveal effect. Text progressively changes color as the user scrolls down the page.

## Features

- **Smooth scroll-based animation**: Text color fills in based on scroll position
- **Highly customizable**: Control colors, direction, thresholds, and more
- **TypeScript support**: Fully typed with comprehensive JSDoc comments
- **Performance optimized**: Uses `requestAnimationFrame` for smooth 60fps animations
- **Accessible**: Text remains selectable and readable at all times
- **Cross-browser compatible**: Works in all modern browsers (no CSS scroll-timeline needed)

## Basic Usage

```tsx
import ScrollRevealText from 'src/components/NonSitecore/ScrollRevealText';

function MyComponent() {
  return (
    <ScrollRevealText 
      as="h2"
      className="display-lg"
    >
      Stay ahead in the fast-paced world of commerce...
    </ScrollRevealText>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | *required* | The text content or child elements to animate |
| `startColor` | `string` | `'#D3D3D3'` | Starting color before animation (hex, rgb, or color name) |
| `endColor` | `string` | `'#2729FF'` | Ending color after animation (hex, rgb, or color name) |
| `direction` | `'left-to-right' \| 'top-to-bottom'` | `'left-to-right'` | Direction of the color reveal |
| `className` | `string` | `''` | Additional CSS class names |
| `as` | `keyof JSX.IntrinsicElements` | `'div'` | HTML tag to render |
| `scrollOptions` | `UseScrollProgressOptions` | `{}` | Scroll progress options (see below) |

## Scroll Options

The `scrollOptions` prop accepts an object with the following properties:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `startThreshold` | `number` | `0.2` | When animation starts (0-1, where 0 is top of viewport, 1 is bottom) |
| `endThreshold` | `number` | `0.8` | When animation completes (0-1) |
| `once` | `boolean` | `false` | If true, animation only runs once (doesn't reset when scrolling back up) |

## Advanced Examples

### Large Heading with Custom Colors

```tsx
<ScrollRevealText
  as="h1"
  className="hero-heading"
  startColor="#999999"
  endColor="#FF6B35"
  direction="left-to-right"
  scrollOptions={{
    startThreshold: 0.3,
    endThreshold: 0.7,
    once: true,
  }}
>
  Transform Your Business
</ScrollRevealText>
```

### Top-to-Bottom Animation

```tsx
<ScrollRevealText
  as="p"
  direction="top-to-bottom"
  startColor="rgba(0, 0, 0, 0.3)"
  endColor="rgba(0, 0, 0, 1)"
>
  Discover the power of modern commerce solutions
</ScrollRevealText>
```

### Multiple Lines with Rich Content

```tsx
<ScrollRevealText as="div" className="content-block">
  <h2>Innovation</h2>
  <p>Driving the future of payments</p>
</ScrollRevealText>
```

## How It Works

The component uses:

1. **`useScrollProgress` hook**: Tracks the element's scroll position and calculates progress (0-1)
2. **CSS `background-clip: text`**: Applies a gradient that changes based on scroll progress
3. **Linear gradient**: Fills the text from start color to end color based on progress

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 14+)
- Opera: ✅ Full support

## Performance Notes

- Uses `requestAnimationFrame` for optimal performance
- Scroll listeners are passive for better scrolling performance
- Minimal DOM operations (only updates inline style)
- No heavy calculations or layout thrashing

## Related

- **Hook**: `src/hooks/useScrollProgress.ts` - The underlying scroll tracking hook
- **Example**: See `LargeScrollingAnimation` variant in `src/components/PageContent/Hero.tsx`

## Customization

The component is designed to be flexible. You can:

- Wrap any content (text, HTML elements, etc.)
- Apply any CSS classes for additional styling
- Use any valid CSS color format (hex, rgb, rgba, named colors)
- Adjust animation timing with scroll thresholds
- Choose animation direction (horizontal or vertical)
