# Corporate Headless application for Global Payments

## Developers - Getting Started


### Export SIF root certificate
To run JSS locally, you need to let nodejs know about the SIF root cert so it will accept the local self signed certificates. This is [Sitecore's walthrough on how to do this](https://doc.sitecore.com/xp/en/developers/hd/latest/sitecore-headless-development/walkthrough--configuring-sitecore-ca-certificates-for-node-js.html). Our recommendation is to use the environment variable method so that you don't have to change the `package.json` file. 

### Run JSS
Ensure that your Sitecore instance is up and running.
1. Checkout the repository
2. Push the new TDS project (GPN.Project.CorporateHeadless.Master) into your local Sitecore instance
3. Make a copy of .env.example file and name it .env.local (this file will not be committed to the repository)
4. Create a Sitecore API Key in "/sitecore/system/Settings/Services/API Keys" and configure CORS and Allowed Controllers to *
5. Ensure the SITECORE_API_HOST, SITECORE_API_KEY (from above) and GRAPH_QL_ENDPOINT point to your local Sitecore instance.
6. Open a Terminal and navigate to src/head/corporate
7. Run "npm install"
8. Run "npm run start:connected"
9. Open a browser and navigate to http://localhost:3000

_Note: changes to the code will automatically be recompiled when running in DEV mode._

## Developers - Connecting your local to a non-local environment

1. Update your local .env file
- SITECORE_API_HOST and GRAPH_QL_ENDPOINT point to the environment, i.e. "https://gpn-sc-xp-u2-cm.dataweavers.io" for UAT2.
- SITECORE_API_KEY - to the API key that is in the environment stored under "/sitecore/system/Settings/Services/API Keys"
2. Run "npm run start:connected"

## Developers - Access the GraphQL playground - Edge Schema Endpoint

https://doc.sitecore.com/xp/en/developers/hd/latest/sitecore-headless-development/sitecore-experience-edge-for-xm-preview-graphql-endpoint.html

1. Login to the Sitecore CM 
2. Navigate to "https://{sitecore-instance}/sitecore/api/graph/edge/ui", i.e. https://gpn-sc-xp-u2-cm.dataweavers.io/sitecore/api/graph/edge/ui
3. Add in the Sitecore API Key to the HTTP Headers section at the bottom:
{
  "sc_apikey":"00000000-0000-0000-0000-000000000000"
}
4. Paste or write query (Examples - https://doc.sitecore.com/xp/en/developers/hd/latest/sitecore-headless-development/query-examples-for-the-delivery-api.html#get-an-item-by-id-or-path)
5. Run the query 

Note: this is specifically for the edge schema, there are other endpoints, such as those for management. It will allow you to search content, get item info, gather the sites available and get the sitemap info. They are the content schemas currently available.

## Developers - Good Practice

# Exclude calls to third party services when DISABLE_SSG_FETCH is enabled
When creating a component or service that is dependent on a third party service, i.e. GraphQL call to Sitecore, it is essential that you wrap the call in a conditional statement to disable when DISABLE_SSG_FETCH is enabled, i.e.

if (process.env.DISABLE_SSG_FETCH != 'true') {
    //this code will only run when we are building in an SSG mode.
}

This is to ensure that the pipeline builds can run in a disconnected state for verification and editing purposes.

# Exclude unnecesary GraphQL or third party calls when in editing mode

The Sitecore layout service will return layout data. In this layout data we can understand if the page is in an editing mode (layoutData.sitecore.context.pageEditing)

"const isPageEditing = layoutData.sitecore.context.pageEditing;"

It is good practice that any calls to the services, i.e. GraphQL calls or other external parties be wrapped in a conditional statement to disable them if in an editing mode, to improve performance.

# Consider caching

Caching can be used in the application, however OOTB this is not share across scaled instances and therefore it should be short lived and not dependent on updates down to the specific second.

See JSS’s memory cache usage as example: DictionaryService and CacheClient.

# Consider where and when component datasources will execute queries to dependent resources

Ensure you are not calling third parties or the GraphQL endpoints unnecessarily. i.e. consider when middleware will run and/or if a component will execute a call unnecessarily.

## Developers - Troubleshooting

### API Key issues

## Nextjs coding_standard
1. Ensure you have an API key generated under "/sitecore/system/Settings/Services/API Keys". If it doesn't exist then create it. It can help to publish it to put it in the cache. 
2. Set the SITECORE_API_KEY value in the .env or .env.local file in your codebase. 

# Dataweavers - Included Code (starter Kit)

## Base - Starter Kit Changes

Description: Basic setup for enabling the Dataweavers pipelines and deployment

Requirement: As detailed below

Files contained:
- output: 'standalone' (Required: improvement for build output in the build pipelines)
- src\Head\Corporate\.npmrc (Required: includes the Dataweavers npm repository used for ODISR, can be added to)
- src\Head\Corporate\.nvmrc (Optional: defines the node version)
- src\Head\Corporate\.env.example (Optional: useful for new developers to copy and rename as a base)
- src\Head\Corporate\src\lib\layout-service-factory.ts (Recommended: minor tweaks to the retry strategies of the layout service for GraphQL. Layout service tracking disabled.)
- src\Head\Corporate\src\lib\dictionary-service-factory.ts (Recommended: minor tweaks to the retry strategies of the dictionary service for GraphQL. )

## JEST - unit testing framework and example

Description: Basic 'get started' for a unit test framework.

Requirement: Optional, can be removed

Files contained:
- src\Head\Corporate\tsconfig.test.json
- src\Head\Corporate\tsconfig.scripts.json
- src\Head\Corporate\jest.setup.ts
- src\Head\Corporate\jest.config.ts
- src\Head\Corporate\__tests__

## Application Insights - instrumentation

Description: Integration of Application Insights log analytics and metrics for the application. 

Requirement: Required, do not remove

Files contained/altered:
- next.config.js
  - experimentation/instrumentationHook added
  - serverComponentsExternalPackages - external packages referenced for build purposes.
- src\Head\Corporate\src\instrumentation.ts
- src\Head\Corporate\src\lib\_platform\logging\applicationInsights.ts
- src\Head\Corporate\src\lib\_platform\logging\debug-log.ts

## Debug - console logging

Description: Integration of the debug module utilised by JSS, allowing for customer managed namespaces for logging.
The application uses the [debug](https://www.npmjs.com/package/debug) module (wrapped in debug-log.ts) for logging.  
Namespaces are already defined (auth, basic, graphqlFetcher, uptick, etc.) under localDebug.

Requirement: Optional, can be removed

Files contained/altered:
- src\Head\Corporate\src\lib\_platform\logging\debug-log.ts

### Local / Dev
- **Warn and Error** logs are **always visible** in the browser console or Node terminal, even if DEBUG is not set.
- **Debug and Info** logs are only shown when you explicitly enable them with DEBUG.
- You can enable logs dynamically:
  - In **browser dev tools**:
   
```js
    localStorage.debug = 'gpn-jss:*'; 
    window.location.reload();
```
   
  - In **Node/SSR dev server**:
   
```bash
    DEBUG="gpn-jss:*" npm run dev
```
### Production
**Error logs** are always visible.
**Warn logs** are hidden by default (to avoid console noise), but can be enabled with DEBUG.
**Debug and Info** logs are hidden by default, only shown if enabled.
Example for troubleshooting in prod:
  
```bash

  DEBUG="gpn-jss::warn,gpn-jss::error" npm start
```
### Usage
``` js
localDebug.uptick.warn('Card data missing "author": %o', item);
localDebug.uptick.error('Failed to render card: %o', err);
localDebug.uptick('SSR render time %dms', elapsed); // debug level
```

`applicationInsights.ts is dependent on this, dependency should be removed if this is removed.`

## Static paths provider for SSG pages included in build.

Description: Allows a static list (json object) of url's/pages to be generated during build for SSG in replacement of the JSS default sitemap. This can be useful if the sitemap contains to many items which may impact build times. 

Requirement: Optional, can be removed

Files contained/altered:
- src\Head\Corporate\src\lib\_platform\utils\static-paths-provider.ts
- src\Head\Corporate\SSG-Prefetch.json

## On Demand Regeneration (ODISR)

Description: Facilitates, on demand incremental static regeneration in the JSS application. In short, this will ensure that the pages are rebuilt when a content author publishes content.

Requirement: Required, do not remove

Files contained/altered:
- const i18nLocales = require('./i18nLocales.json'); - allows centralisation of the next.js locales.
- next.config.js
  - transpilePackages: ['@dataweavers/on-demand-regeneration.nextjs'],
  - i18n.locales: i18nLocales,
- NPM Install - "@dataweavers/on-demand-regeneration.nextjs": "x",
  - src/pages/api/odr - endpoints added upon install, these are excluded from git to allow for updates. 

## HTTP security headers

Description: Adds basic, envrionment variable controlled, security header functionality into the application. 

Requirement: Optional, can be removed/altered

Files contained/altered:
- src\Head\Corporate\src\lib\next-config\plugins\security-headers.js

## HTTP CORS headers

Description: Alteration to the JSS CORS headers added to allow for an envrionment variable controlled value

Requirement: Optional, can be removed/altered

Files contained/altered:
- src\Head\Corporate\src\lib\next-config\plugins\cors-header.js
- src\Head\Corporate\scripts\generate-config.ts (addition of the build time env variable)


Next.js Coding Standards
With Bootstrap, SCSS, and TypeScript
1. Project Structure
Organize the project for clarity and maintainability.

/src
│-- /components          # Reusable Next JS components.
│   │-- /common          # Common components used across the application. Header, Footer etc
│   │-- /ui              # Small, reusable UI components (buttons, cards, etc.)
│   │-- /layout          # Layout components (e.g., components from layout service)
│-- /pages               # Next.js pages
│-- /public              # Static assets (images, fonts, etc.)
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
│-- /utils               # Utility functions and helpers
│-- /hooks               # Custom React hooks
│-- tsconfig.json        # TypeScript configuration
│-- next.config.js       # Next.js configuration
2. General Coding Standards
File Naming
PascalCase for components: Button.tsx, NavBar.tsx
camelCase for variables, utility functions, and hooks: fetchData.ts, getUserDetails.ts
kebab-case for SCSS files: button-style.scss
Code Formatting
Use Prettier and ESLint for consistent formatting.
ESLint recommended config: json { "extends": [ "next/core-web-vitals", "plugin:@typescript-eslint/recommended" ], "rules": { "@typescript-eslint/no-unused-vars": "error", "react/jsx-boolean-value": "error", "react/jsx-sort-props": "error" } }
Imports
Organize imports in the following order:
Built-in modules (e.g., next/router)
Third-party modules (e.g., bootstrap, axios)
Custom modules (e.g., @/components, @/utils)
Use absolute imports with baseUrl defined in tsconfig.json: json { "compilerOptions": { "baseUrl": ".", "paths": { "@/components/*": ["components/*"], "@/utils/*": ["utils/*"] } } }
3. SCSS Integration
Global SCSS
Import SCSS into _app.tsx for global styles: tsx import '@/styles/globals.scss';
Use variables.scss for colors, fonts, and spacing.
Example: variables.scss
$primary-color: #007bff;
$secondary-color: #6c757d;
$font-family: 'Roboto', sans-serif;
$spacing-unit: 8px;
SCSS Mixins
Create reusable mixins for consistency:

// mixins.scss
@mixin flex-center($direction: row) {
  display: flex;
  flex-direction: $direction;
  justify-content: center;
  align-items: center;
}

@mixin responsive-font($size) {
  font-size: $size;

  @media (max-width: 768px) {
    font-size: $size * 0.8;
  }
}
Component SCSS
Use .module.scss files for scoped styles:

// Button.module.scss
.button {
  padding: $spacing-unit;
  border-radius: 4px;

  &--primary {
    background-color: $primary-color;
    color: white;
  }

  &--secondary {
    background-color: $secondary-color;
    color: white;
  }
}
Example: Button.tsx
import styles from './Button.module.scss';

interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ label, variant = 'primary' }) => {
  return (
    <button className={`${styles.button} ${styles[`button--${variant}`]}`}>
      {label}
    </button>
  );
};

export default Button;
4. Naming Conventions
Utility-First CSS Class Naming Convention
If you're not using BEM, adopt a utility-first approach for faster prototyping, similar to Tailwind CSS.

Key Principles
Classes should describe functionality directly.
Combine smaller utility classes to style elements rather than relying on complex selectors.
Example utility classes:
// Utility Classes

// Flexbox Utilities
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

// Spacing Utilities
.m-1 {
  margin: 4px;
}

.p-1 {
  padding: 4px;
}

// Text Utilities
.text-primary {
  color: $primary-color;
}

.text-secondary {
  color: $secondary-color;
}

// Background Utilities
.bg-primary {
  background-color: $primary-color;
}

.bg-secondary {
  background-color: $secondary-color;
}
Component Usage
Combine utility classes directly in JSX components:

<div className="flex-center bg-primary p-1">
  <p className="text-secondary">Welcome to Utility-First CSS</p>
</div>
Advantages of Utility-First Approach
Faster Development: No need to create custom styles repeatedly.
Reusable: Classes can be used across components.
Performance: Avoids deeply nested CSS selectors.
Variables and Functions
Use camelCase for variables and functions: fetchData, userDetails
Use PascalCase for React components: Header.tsx, NavBar.tsx
Use kebab-case for folders and SCSS files: user-card.module.scss
5. Bootstrap Integration
Customizing Bootstrap
Import Bootstrap SCSS and customize variables in globals.scss:
```scss // globals.scss $primary: #007bff; $secondary: #6c757d;

@import '~bootstrap/scss/bootstrap'; ```

Bootstrap Utility Classes
Use Bootstrap utility classes directly for spacing, grids, and layout.
Extend Bootstrap classes for overrides:
```scss .btn-primary { background-color: $primary-color; border-radius: 4px;

&:hover {
  background-color: darken($primary-color, 10%);
}
} ```

6. TypeScript Best Practices
Typing Props
Use interfaces for props:
```tsx interface CardProps { title: string; description: string; }

const Card = (props: { title; description }) => { return ( <div>

{title}
{description}

</div> ); }; ```
Global Typing
Create centralized types in global.d.ts for API responses and shared interfaces:
```ts export interface ApiResponse<T> { data: T; success: boolean; message: string; }

export interface User { id: number; name: string; } ```

7. Performance Optimization
Dynamic Imports
Dynamically load heavy components:
```tsx import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent')); ```

Next.js Image Optimization
Use next/image for optimized images:
```tsx import Image from 'next/image';

<Image src="/images/logo.png" alt="Logo" width={200} height={100} />; ```

Prefetching
Prefetch links with next/link:
```tsx import Link from 'next/link';

<Link href="/about"> About Us </Link>; ```

8. Summary
By following these standards:

This will ensure that the project has a clean structure.
SCSS and Bootstrap integration will be consistent.
TypeScript will enforce strong typing and maintainability.
Your code will follow best practices for performance and scalability.
Happy Coding! 🚀

