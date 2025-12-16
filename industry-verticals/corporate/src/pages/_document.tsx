import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Add data-ot-ignore to Next.js and Sitecore scripts */}
        <Script
          id="ot-ignore-injector"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function addOTIgnoreAttribute() {
                  // Target Next.js script bundles and Sitecore scripts
                  const scriptSelectors = [
                    'script[src*="/_next/static/"]',              // Next.js static chunks
                    'script[src*="/_next/"]',                     // All Next.js scripts
                    'script[src*="sitecore"]'                     // Any Sitecore scripts
                  ];
                  
                  scriptSelectors.forEach(selector => {
                    document.querySelectorAll(selector).forEach(script => {
                      if (!script.hasAttribute('data-ot-ignore')) {
                        script.setAttribute('data-ot-ignore', '');
                      }
                    });
                  });
                }
                
                // Run immediately
                addOTIgnoreAttribute();
                
                // Monitor for dynamically added scripts
                const observer = new MutationObserver(function(mutations) {
                  let hasNewScripts = false;
                  mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                      if (node.nodeType === 1 && 
                          (node.tagName === 'SCRIPT' || node.querySelector('script'))) {
                        hasNewScripts = true;
                      }
                    });
                  });
                  
                  if (hasNewScripts) {
                    setTimeout(addOTIgnoreAttribute, 50);
                  }
                });
                
                // Observe head and body for script changes - with null checks
                if (document.head) {
                  observer.observe(document.head, { childList: true, subtree: true });
                }
                if (document.body) {
                  observer.observe(document.body, { childList: true, subtree: true });
                }
                
                // Fallback for late-loading scripts
                document.addEventListener('DOMContentLoaded', addOTIgnoreAttribute);
                window.addEventListener('load', addOTIgnoreAttribute);
              })();
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
