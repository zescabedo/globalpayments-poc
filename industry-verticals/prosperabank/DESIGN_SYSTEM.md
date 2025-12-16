# Global Payments Design System Integration

This application has been rebuilt using the **Global Payments Design System** and is fully aligned with **Sitecore XM Cloud** and **ContentSDK** patterns.

## Overview

The design system integration provides:
- ✅ Complete typography system (Display, Title, Body, Label)
- ✅ Comprehensive color palette (Primary, Secondary, Tertiary, Neutrals, Gradients)
- ✅ Responsive spacing system
- ✅ Button components aligned with Global Payments patterns
- ✅ Sitecore ContentSDK integration
- ✅ TypeScript support with full type safety

## Design System Reference

**Storybook**: https://design.globalpayments.com

### Key Pages:
- [Build Guide](https://design.globalpayments.com/?path=/story/%F0%9F%A7%AD-digital-build-guide--build-guide-landing-page)
- [Typography](https://design.globalpayments.com/?path=/story/atoms-typography--all-typography)
- [Colors](https://design.globalpayments.com/?path=/story/atoms-colors--all-colors)
- [Spacing](https://design.globalpayments.com/?path=/story/atoms-spacing--all-spacing)
- [Buttons](https://design.globalpayments.com/?path=/story/atoms-buttons--all-buttons)

## File Structure

```
src/
├── lib/
│   └── design-system/
│       ├── tokens.ts          # TypeScript design tokens
│       └── index.ts           # Design system exports
├── components/
│   └── DesignSystem/
│       ├── Button.tsx         # Button component
│       └── index.ts           # Component exports
└── assets/
    └── sass/
        ├── abstracts/
        │   └── vars/
        │       └── _globalPayments.scss  # SCSS variables
        ├── base/
        │   ├── typography/
        │   │   └── _globalPayments-typography.scss  # Typography utilities
        │   └── spacing/
        │       └── _globalPayments-spacing.scss      # Spacing utilities
        └── components/
            └── _buttons.scss  # Button styles
```

## Usage

### Typography

Use typography classes directly in your components:

```tsx
import { Text } from '@sitecore-content-sdk/nextjs';

// Display styles
<Text field={titleField} tag="h1" className="display-lg" />

// Title styles
<Text field={headingField} tag="h2" className="title-sm" />

// Body styles
<div className="body-md">
  <RichText field={contentField} />
</div>

// Label/Eyebrow styles
<Text field={tagField} tag="h6" className="label-md brow" />
```

### Colors

Use CSS variables or SCSS variables:

```scss
// SCSS
.my-component {
  background-color: $gpn-blue-500;
  color: $gpn-white;
}

// CSS
.my-component {
  background-color: var(--gpn-theme-blue-500);
  color: var(--gpn-theme-white-255);
}
```

### Spacing

Use responsive spacing utilities:

```tsx
<div className="padding-t-lg margin-b-md">
  {/* Content */}
</div>

// Or use Bootstrap-style utilities
<div className="gpn-mt-4 gpn-pb-6">
  {/* Content */}
</div>
```

### Buttons

Use the Button component with Sitecore ContentSDK:

```tsx
import { Button } from '@/components/DesignSystem';
import { LinkField } from '@sitecore-content-sdk/nextjs';

// With Sitecore link field
<Button 
  variant="primary" 
  size="md"
  linkField={ctaLinkField}
>
  Click Me
</Button>

// As regular button
<Button 
  variant="secondary" 
  size="lg"
  onClick={handleClick}
>
  Submit
</Button>
```

### Button Variants

- `primary` - Primary brand button (blue background)
- `secondary` - Secondary button (white background, blue border)
- `tertiary` - Tertiary button (transparent background)
- `outline` - Outline button (transparent background, grey border)
- `ghost` - Ghost button (transparent, no border)
- `link` - Link-style button (underlined text)

### Button Sizes

- `sm` - Small button (0.8rem padding)
- `md` - Medium button (1.2rem padding) - Default
- `lg` - Large button (1.6rem padding)

## Sitecore Integration

All components are designed to work seamlessly with Sitecore XM Cloud:

### Field Handling

```tsx
import { Text, RichText, Link, useSitecore } from '@sitecore-content-sdk/nextjs';

export const MyComponent = ({ fields }: ComponentProps) => {
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;
  
  // Safe field access with fallbacks
  const { data } = fields || {};
  const { datasource } = data || {};
  const { title, description, ctaLink } = datasource || {};
  
  return (
    <div>
      {(title?.jsonValue?.value || isEditing) && (
        <Text field={title?.jsonValue} tag="h2" className="title-sm" />
      )}
      
      {(description?.jsonValue?.value || isEditing) && (
        <div className="body-md">
          <RichText field={description?.jsonValue} />
        </div>
      )}
      
      {(ctaLink?.jsonValue?.value?.href || isEditing) && (
        <Button 
          variant="primary"
          linkField={ctaLink?.jsonValue}
        >
          Learn More
        </Button>
      )}
    </div>
  );
};
```

## Design Tokens

### Typography Scale

| Style | Font Size | Line Height | Usage |
|-------|-----------|-------------|-------|
| Display XXL | 9.0rem | 9.0rem | Hero headlines |
| Display XL | 6.4rem | 7.2rem | Large hero headlines |
| Display LG | 4.8rem | 6.0rem | Hero headlines |
| Display MD | 3.2rem | 4.0rem | Section headlines |
| Title SM | 2.4rem | 3.2rem | Section titles |
| Title XS | 2.0rem | 2.8rem | Subsection titles |
| Title XXS | 1.6rem | 2.4rem | Card titles |
| Body MD | 2.0rem | 3.2rem | Default body text |
| Body SM | 1.6rem | 2.4rem | Secondary body text |
| Body XS | 1.2rem | 1.6rem | Source citations |
| Body XXS | 0.8rem | 1.2rem | Legal text |

### Color Palette

#### Primary Colors
- **Blue 500** (`#262AFF`) - Primary brand blue
- **White** (`#FFFFFF`) - Base white

#### Secondary Colors
- **Blue 600** (`#1B1EC6`) - Darker brand blue
- **Black 950** (`#0C0C0C`) - Near-black for text

#### Tertiary Colors
- **Blue 300** (`#1CABFF`) - Light accent blue
- **Yellow 310** (`#FFCC00`) - Bright yellow accent
- **Orange 200** (`#FDA052`) - Orange accent
- **Red 200** (`#F4364C`) - Error/alert red
- **Purple 400** (`#87179D`) - Purple accent
- **Green 210** (`#00C75D`) - Success green

#### Neutral Colors
- **Grey 110** (`#F8F8F8`) - Lightest grey
- **Grey 120** (`#F4F4F4`) - Very light grey
- **Grey 200** (`#EEEEEE`) - Light grey
- **Grey 300** (`#DDDDDD`) - Medium-light grey
- **Grey 400** (`#C4C4C4`) - Medium grey
- **Grey 500** (`#909090`) - Medium-dark grey
- **Grey 600** (`#595959`) - Dark grey

### Spacing Scale

Spacing uses a base unit of **0.8rem (8px)** and scales responsively:

| Token | Desktop | Tablet | Mobile |
|-------|---------|--------|--------|
| MACRO | 14.4rem | 8rem | 6.4rem |
| XXXL | 8rem | 7.2rem | 6.4rem |
| XXL | 6.4rem | 5.6rem | 4.8rem |
| XL | 4.8rem | 4rem | 4rem |
| LG | 4rem | 4rem | 3.2rem |
| MD | 3.2rem | 2.4rem | 2.4rem |
| SM | 2.4rem | 2.4rem | 2.4rem |
| XS | 1.6rem | 1.6rem | 1.6rem |
| XXS | 0.8rem | 0.8rem | 0.8rem |

## Best Practices

### 1. Always Use Design System Tokens

✅ **Good:**
```tsx
<div className="display-lg">Title</div>
<Button variant="primary">Click</Button>
```

❌ **Bad:**
```tsx
<div style={{ fontSize: '4.8rem' }}>Title</div>
<button style={{ backgroundColor: '#262AFF' }}>Click</button>
```

### 2. Handle Sitecore Fields Safely

✅ **Good:**
```tsx
const { data } = fields || {};
const { datasource } = data || {};
const { title } = datasource || {};

{(title?.jsonValue?.value || isEditing) && (
  <Text field={title?.jsonValue} tag="h2" className="title-sm" />
)}
```

❌ **Bad:**
```tsx
<Text field={fields.data.datasource.title.jsonValue} tag="h2" />
```

### 3. Use Responsive Spacing

✅ **Good:**
```tsx
<div className="padding-t-lg margin-b-md">
  {/* Content */}
</div>
```

❌ **Bad:**
```tsx
<div style={{ paddingTop: '4rem', marginBottom: '3.2rem' }}>
  {/* Content */}
</div>
```

### 4. Leverage Button Component

✅ **Good:**
```tsx
<Button variant="primary" linkField={ctaField} size="md">
  Learn More
</Button>
```

❌ **Bad:**
```tsx
<a href={ctaField.value.href} className="button button-main">
  Learn More
</a>
```

## Migration Guide

### Updating Existing Components

1. **Replace custom typography** with design system classes
2. **Replace custom colors** with design system variables
3. **Replace custom spacing** with design system utilities
4. **Replace button elements** with Button component
5. **Ensure safe field access** for Sitecore fields

### Example Migration

**Before:**
```tsx
<div className="hero-title" style={{ fontSize: '3.5rem', fontWeight: 300 }}>
  <Text field={titleField} />
</div>
<a href={linkField.value.href} className="button button-main">
  Click Me
</a>
```

**After:**
```tsx
<Text field={titleField} tag="h1" className="display-md" />
<Button variant="primary" linkField={linkField}>
  Click Me
</Button>
```

## Resources

- [Global Payments Storybook](https://design.globalpayments.com)
- [Sitecore ContentSDK Documentation](https://doc.sitecore.com/xm-cloud/en/developers/xm-cloud/content-sdk-for-nextjs/index-en.html)
- [Sitecore XM Cloud Documentation](https://doc.sitecore.com/xm-cloud)

## Support

For questions or issues with the design system integration, please refer to:
- Global Payments Storybook for design specifications
- Sitecore documentation for ContentSDK integration
- Internal team documentation for component patterns








