# Hero Component Dependencies from GPN-Sitecore

## Files Copied

### Fonts
- `/src/assets/fonts/GPCommerce-Light.woff` / `.woff2`
- `/src/assets/fonts/GPCommerce-Regular.woff` / `.woff2`
- `/src/assets/fonts/GPCommerce-Medium.woff` / `.woff2`
- `/src/assets/fonts/GPCommerce-Bold.woff` / `.woff2`
- `/src/assets/fonts/GPCommerce-Black.woff` / `.woff2`

### Icons
- `/src/assets/icons/play-button-white.svg`
- `/src/assets/icons/pause-button-white.svg`

## Required SCSS Infrastructure

### Variables Needed
- Font family: `$gpn-theme-font-family-sans-serif: 'GPCommerce', 'Helvetica Neue'`
- Font weights: `$gpn-theme-font-weight-light: 300`, `regular: 400`, `medium: 500`, `bold: 700`, `black: 900`
- Font maps: `$gpn-theme-h-display-xl-font`, `$gpn-theme-label-lg-font`, `$gpn-theme-body-md-font`
- Spacing maps: `$gpn-theme-spacing-sizes` (with 'sm', 'md', 'lg' breakpoints)
- Colors: All `$gpn-theme-*` color variables
- Z-index: `$gpn-theme-zindex-component-overlay`, `$gpn-theme-zindex-component-full-bleed-conatiner`
- Radius: `$gpn-theme-radius-xl`, `$gpn-theme-radius-lg`
- Featured Hero map: `$gpn-theme-featured-hero` with configuration values
- Icon variables: `$gpn-theme-icon-play-button-white`, `$gpn-theme-icon-pause-button-white`

### Mixins Needed
- `@mixin font-base($details, $isOverride: false)` - For typography
- `@mixin gpn-spacing($attributes, $size)` - For responsive spacing
- `@mixin media-breakpoint-up($breakpoint)` - Bootstrap breakpoint mixin
- `@mixin make-col($size)` - Bootstrap column mixin

### Functions Needed
- `@function gpn-spacing-size($breakpoint, $size)` - Get spacing value

### Placeholder Classes Needed
- `%h-xl` - For display-xl headings
- `%label-lg` - For label-lg text
- `%p-md` - For body-md text
- `%btn-cta-primary` - For primary CTA buttons

## Component Structure

### SCSS Structure
The Hero component SCSS should match `/GPN-Sitecore/src/Head/Corporate/src/styles/components/FeaturedHero/_component-featured-hero.scss` exactly.

### TypeScript Structure
The Hero component TypeScript should match `/GPN-Sitecore/src/Head/Corporate/src/components/layout/FeaturedHero/FeaturedHero.tsx` structure, adapted for ContentSDK.

## Key Differences from Current Implementation

1. **Background Images**: Uses `::before` pseudo-element with CSS variables for responsive images
2. **Typography**: Uses placeholder classes (`%h-xl`, `%label-lg`, `%p-md`) instead of direct classes
3. **Spacing**: Uses `gpn-spacing-size()` function and `@include gpn-spacing()` mixin
4. **Layout**: Uses Bootstrap's `make-col()` mixin for responsive columns
5. **Full-bleed Container**: Positioned at bottom with specific heights from `$gpn-theme-featured-hero` map
6. **Video Controls**: Uses icon variables for play/pause buttons








