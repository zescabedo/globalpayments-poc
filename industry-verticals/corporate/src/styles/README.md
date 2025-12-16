# Structure for project styling
src/
├── styles/
│   ├── utilities/
│   │   ├── _mixins.scss       // All custom mixins
│   │   └── _functions.scss    // All custom SCSS functions
│   ├── themes/
│   │   ├── _default-theme.scss  // Default theme styles
│   │   └── _custom-theme.scss   // Custom theme styles
│   ├── custom/
│   │   ├── _variables.scss      // Override Bootstrap variables
│   │   ├── _overrides.scss      // Specific Bootstrap component overrides
│   │   └── _extensions.scss     // Additional styles or new components
│   ├── global.scss                // Primary SCSS file that imports everything


## Common Coding Standards for SCSS
### Naming Conventions
1. Selectors: Use kebab-case for class names (e.g., .my-selector), which enhances readability and is HTML-friendly.
2. Variables: Use descriptive names with a logical prefix (e.g., $color-primary, $font-size-large).
3. Mixins and Functions: Name mixins and functions with clear, functional names to indicate their purpose (e.g., @mixin center-content).

### Commenting
1. File Comments: Each SCSS file should start with a block comment describing the contents and purpose of the file.
2. Section Comments: Use comments to divide the file into logical sections.
3. Code Comments: Provide comments for complex, unclear, or important parts of your styles to aid other developers.

### Variables and Theming
1. Global vs. Local: Define global variables in a _variables.scss file. Use local variables within specific components only if they aren't reused elsewhere.
2. Thematic Variables: Use thematic variables for colors, spacing, and typography to maintain consistency and facilitate theming.

### Nested Rules
1. Depth Limit: Avoid nesting deeper than 3 levels to prevent overly specific CSS selectors.
2. Parent Selector (&): Use it for pseudo-classes and modifiers, but avoid complex nesting chains.
