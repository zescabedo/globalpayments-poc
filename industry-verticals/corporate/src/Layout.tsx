import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import {
  Placeholder,
  LayoutServiceData,
  Field,
  HTMLLink,
  ImageField,
  ComponentRendering,
  Page,
} from '@sitecore-content-sdk/nextjs';
import config from 'temp/config';
import { VisitorIdentification } from 'src/components/analytics/VisitorIdentification';
import { initializeAnalyticsTracking } from './utils/analyticsTracking';
import { observeFormsForTracking, populateTrackingFields } from './utils/formTracking';
import { ModalProvider } from './components/ui/Modal/ModalProvider';
import OverlayLinkHandler from './components/ui/Modal/OverlayLinkHandler';
import RegionSelectorModal from './components/ui/Modal/RegionSelectorModal';
import { PageViewTracker } from '@/components/analytics/PageViewTracker';
import { useSitecoreTracking } from '@/components/analytics/SitecoreTracking';
import TrustpilotWidgetRefresher from './components/meta/TrustPilotRefresher';
import { FooterProps } from './components/common/Footer/Footer.types';
import localDebug from '@/lib/_platform/logging/debug-log';
import { useRouter } from 'next/router';
import type { RouteData } from '@sitecore-content-sdk/nextjs';
import Cookies from 'js-cookie';
import { formatToGuid } from './utils/tools';
import { OriginCookieName, ScriptPlaceholderConstants } from './constants/appConstants';
import { sites } from './utils/locales';
import getFieldValue from './utils/getFieldValue';

// Prefix public assets with a public URL to enable compatibility with Sitecore Experience Editor.
// If you're not supporting the Experience Editor, you can remove this.

interface CanonicalAlternate {
  Href: string;
  HrefLang: string;
  IsCanonical: boolean;
}
interface LayoutProps {
  // Support both ContentSDK page prop and legacy layoutData prop for backward compatibility
  page?: Page;
  layoutData?: LayoutServiceData;
  canonicalAlternates?: CanonicalAlternate[] | null;
  trackingDisabled?: boolean;
}
interface UptickRobots {
  id: string;
  name: string;
  Value: string;
}
interface OOTBRobots {
  fields: { Value: Field };
}
interface RouteFields {
  [key: string]: unknown;
  Title?: Field;
  OpenGraphTitle?: Field;
  ContentTitle: Field;
  OpenGraphDescription?: Field;
  OpenGraphImageUrl?: ImageField;
  OpenGraphType?: Field;
  OpenGraphSiteName?: Field;
  OpenGraphAppId?: Field;
  OpenGraphAdmins?: Field;
  MetaKeywords?: Field;
  MetaTitle?: Field;
  MetaDescription?: Field;
  Robots?: OOTBRobots | UptickRobots[];
  NoFollow?: { value: boolean };
  NoIndex?: { value: boolean };
  NoSnippet?: { value: boolean };
  TwitterCardType?: { fields: { Value: Field } };
  TwitterTitle?: Field;
  TwitterDescription?: Field;
  TwitterImage?: ImageField;
  TwitterSite?: Field;
}

interface CustomRouteData extends RouteData {
  browserTitle: string;
}

type ContextTracking = {
  profiles?: Array<{ name: string; keys: Record<string, number> }>;
  campaigns?: Array<{ id: string }>;
  events?: Array<{ id: string }>;
  goals?: Array<{ id: string }>;
};

//  Helper to extract FooterProps
function getFooterComponentProps(route: RouteData): FooterProps | null {
  const footerPlaceholder = route?.placeholders?.['gpn-headless-footer'];
  if (footerPlaceholder && Array.isArray(footerPlaceholder)) {
    for (const rendering of footerPlaceholder) {
      const placeholders = (rendering as ComponentRendering)?.placeholders;

      if (!placeholders) continue;

      // Use regex to match any placeholder following the pattern sxa-*-footer
      const sxaFooterRegex = /^sxa-.+-footer$/;

      // Find all matching placeholder keys (in case there are multiple)
      const matchingPlaceholderKeys = Object.keys(placeholders).filter((key) =>
        sxaFooterRegex.test(key)
      );

      localDebug.gpn('Footer placeholder keys found:', matchingPlaceholderKeys);

      // Try each matching placeholder until we find a footer component
      for (const placeholderKey of matchingPlaceholderKeys) {
        const sxaFooterPlaceholder = placeholders[placeholderKey];

        if (Array.isArray(sxaFooterPlaceholder)) {
          const footerRendering = sxaFooterPlaceholder.find((item) =>
            (item as ComponentRendering)?.componentName?.toLowerCase().includes('footer')
          );

          if (footerRendering) {
            localDebug.gpn(`Footer component found in placeholder: ${placeholderKey}`);
            return {
              rendering: footerRendering,
            } as FooterProps;
          }
        }
      }
    }
  }
  return null;
}

const ScriptsInjector = ({ content, isEditing }: { content: string; isEditing: boolean }) => {
  useEffect(() => {
    if (!content) {
      return;
    }

    try {
      // Get all possible targets from constants
      const allTargets = ScriptPlaceholderConstants.placeholderConfigs.map(
        (config) => config.target
      );
      const uniqueTargets = [...new Set(allTargets)]; // Remove duplicates

      // Create dynamic regex that matches any target
      const targetRegex = new RegExp(`<!-- TARGET:(${uniqueTargets.join('|')}) -->`, 'g');

      // Split content by any target marker
      const sections = content.split(targetRegex);
      let currentTarget = 'head'; // Default target

      sections.forEach((section) => {
        // Skip empty sections
        if (!section.trim()) return;

        // Check if this section is any target marker
        if (uniqueTargets.includes(section)) {
          currentTarget = section;
          return;
        }

        // Process the HTML content for the current target
        const container = document.createElement('div');
        container.innerHTML = section;

        // Handle all child nodes (elements, comments, text nodes)
        Array.from(container.childNodes).forEach((node) => {
          try {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as Element;
              const tagName = el.tagName.toLowerCase();

              // List of all possible elements we want to handle
              const elementTypes = ['script', 'link', 'noscript', 'meta', 'style'];

              if (elementTypes.includes(tagName)) {
                // Skip OneTrust scripts when in editing mode
                if (isEditing && tagName === 'script') {
                  const src = el.getAttribute('src') || '';
                  const innerHTML = el.innerHTML || '';
                  if (
                    src.includes('cookielaw.org/consent') ||
                    src.includes('cookielaw.org/scripttemplates/otSDKStub.js') ||
                    innerHTML.includes('OptanonWrapper')
                  ) {
                    return; // Skip this script
                  }
                }

                const newElement = document.createElement(tagName);

                // Copy all attributes
                Array.from(el.attributes).forEach((attr) => {
                  try {
                    newElement.setAttribute(attr.name, attr.value);
                  } catch (attrError) {
                    localDebug.gpn.error(
                      `Error setting attribute ${attr.name} for ${tagName}:`,
                      attrError
                    );
                  }
                });

                // Handle inner content
                if (el.innerHTML) {
                  newElement.innerHTML = el.innerHTML;
                }

                // Inject based on target injection rules from constants
                injectElementByTarget(newElement, currentTarget, tagName);
              }
            } else if (node.nodeType === Node.COMMENT_NODE) {
              const commentNode = document.createComment((node as Comment).data);
              injectElementByTarget(commentNode, currentTarget, 'comment');
            } else if (node.nodeType === Node.TEXT_NODE) {
              if (node.textContent && node.textContent.trim()) {
                const textNode = document.createTextNode(node.textContent);
                injectElementByTarget(textNode, currentTarget, 'text');
              }
            }
          } catch (nodeError) {
            localDebug.gpn.error(`Error processing node for ${currentTarget}:`, nodeError);
          }
        });
      });
    } catch (error) {
      localDebug.gpn.error('Error in ScriptsInjector:', error);
    }
  }, [content, isEditing]);

  // Dynamic injection function based on constants
  const injectElementByTarget = (
    element: HTMLElement | Comment | Text,
    target: string,
    elementType: string
  ) => {
    const injectionRule =
      ScriptPlaceholderConstants.targetInjectionRules[
        target as keyof typeof ScriptPlaceholderConstants.targetInjectionRules
      ];

    switch (injectionRule) {
      case 'document.head':
        if (!document.head.contains(element as Node)) {
          document.head.appendChild(element as Node);
        }
        break;

      case 'before-__next':
        if (elementType === 'noscript' || elementType === 'script') {
          const nextDiv = document.getElementById('__next');
          if (nextDiv && nextDiv.parentNode) {
            nextDiv.parentNode.insertBefore(element as Node, nextDiv);
          } else {
            document.body.appendChild(element as Node);
          }
        } else {
          // Other elements (meta, link, style) go to head, but comments/text respect target
          if (elementType === 'comment' || elementType === 'text') {
            const nextDiv = document.getElementById('__next');
            if (nextDiv && nextDiv.parentNode) {
              nextDiv.parentNode.insertBefore(element as Node, nextDiv);
            } else {
              document.body.appendChild(element as Node);
            }
          } else {
            if (!document.head.contains(element as Node)) {
              document.head.appendChild(element as Node);
            }
          }
        }
        break;

      case 'document.body':
        if (!document.body.contains(element as Node)) {
          document.body.appendChild(element as Node);
        }
        break;

      default:
        // Fallback to head for unknown targets
        if (!document.head.contains(element as Node)) {
          document.head.appendChild(element as Node);
        }
        break;
    }
  };

  return null;
};

const Layout = ({
  page,
  layoutData: layoutDataProp,
  canonicalAlternates,
  trackingDisabled,
}: LayoutProps): JSX.Element => {
  const [scriptsSnippets, setScriptsSnippetsHtml] = useState('');
  
  // Extract layoutData from page if provided (ContentSDK pattern), otherwise use layoutDataProp (legacy)
  const layoutData: LayoutServiceData = page?.layout || layoutDataProp;
  
  if (!layoutData) {
    console.error('Layout: Either page or layoutData must be provided');
    return <></>;
  }

  const { route } = layoutData.sitecore;

  const fields = route?.fields as RouteFields;
  const isPageEditing = layoutData.sitecore.context.pageEditing;
  const canonicalAlternates = layoutData.sitecore.context.canonicalAlternates;
  const mainClassPageEditing = isPageEditing ? 'editing-mode' : 'prod-mode';
  const siteName = layoutData?.sitecore?.context?.site?.name || config.sitecoreSiteName;
  const publicUrlFromSites = sites.find((site) => site.name === siteName)?.publicUrl;
  const publicUrl = publicUrlFromSites || config.publicUrl;

  const { triggerCampaign, triggerEvent, triggerGoal } = useSitecoreTracking(siteName);
  const tracking = (layoutData.sitecore.context.tracking as ContextTracking) || {};
  const router = useRouter();

  // Get public URL from query parameters (set by middleware)
  const getPublicUrl = (): string => {
    if (typeof window === 'undefined') return publicUrl; //fallback (env/config) to avoid hydration mismatch

    // Client: prefer middleware-set cookie, then live browser origin, then fallback as suggested
    const cookieOrigin = Cookies.get(OriginCookieName);
    return cookieOrigin || window.location.origin || publicUrl;
  };

  const dynamicPublicUrl = getPublicUrl();

  // Track campaigns, events, and goals from the context
  useEffect(() => {
    tracking.campaigns?.forEach((c) => triggerCampaign(c.id));
    tracking.events?.forEach((e) => triggerEvent(e.id));
    tracking.goals?.forEach((g) => triggerGoal(g.id));
  }, [tracking, triggerCampaign, triggerEvent, triggerGoal]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const campaignId = urlParams.get('sc_camp');

    const formattedId = (() => {
      if (!campaignId || campaignId.length !== 32) return null;
      return formatToGuid(campaignId);
    })();

    if (formattedId) {
      triggerCampaign(formattedId);
    }
  }, [router.query.sc_camp, triggerCampaign]);

  // Resolve relative path to absolute using hostname from cookie
  // Helper to resolve relative image paths to absolute URLs using hostname from cookie or window.location.origin
  function resolveImageUrl(imagePath?: string): string | undefined {
    if (!imagePath) return undefined;

    if (typeof window === 'undefined') {
      // Server-side: use middleware-provided public URL
      if (dynamicPublicUrl && !imagePath.startsWith('http')) {
        return (
          dynamicPublicUrl.replace(/\/$/, '') + (imagePath.startsWith('/') ? '' : '/') + imagePath
        );
      }
      return imagePath;
    }

    // Client-side: existing logic
    let hostname = Cookies.get(OriginCookieName);
    if (!hostname) {
      try {
        hostname = window.location.origin;
      } catch {
        hostname = '';
      }
    }

    if (hostname && !imagePath.startsWith('http')) {
      return hostname.replace(/\/$/, '') + (imagePath.startsWith('/') ? '' : '/') + imagePath;
    }
    return imagePath;
  }

  const ogTitle =
    getFieldValue(fields?.OpenGraphTitle) ||
    getFieldValue(fields?.Title) ||
    route?.displayName?.toString() ||
    route?.name?.toString();
  const ogLocale = layoutData.sitecore.context.language;
  const currentPath = typeof window === 'undefined' ? '' : router.asPath || '';
  const ogUrl = layoutData.sitecore.context.pageEditing
    ? `${dynamicPublicUrl}${currentPath}`
    : `${dynamicPublicUrl}${currentPath.replace(/\/$/, '')}`;
  const ogDescription = getFieldValue(fields?.OpenGraphDescription);
  const ogImage = resolveImageUrl(fields?.OpenGraphImageUrl?.value?.src?.toString());
  const ogType = getFieldValue(fields?.OpenGraphType);
  const ogSiteName = getFieldValue(fields?.OpenGraphSiteName);
  const ogAppId = getFieldValue(fields?.OpenGraphAppId);
  const ogAdmins = getFieldValue(fields?.OpenGraphAdmins);
  const robot =
    (fields?.Robots as OOTBRobots)?.fields?.Value?.value?.toString?.() ??
    (Array.isArray(fields?.Robots)
      ? (fields?.Robots as UptickRobots[])[0]?.Value?.toString?.()
      : undefined);
  const metaTitle = getFieldValue(fields?.MetaTitle) || ogTitle;
  const metaDescription = getFieldValue(fields?.MetaDescription);
  const metaKeywords = getFieldValue(fields?.MetaKeywords);
  const twitterType = fields?.TwitterCardType?.fields?.Value?.value?.toString();
  const twitterTitle = fields?.TwitterTitle?.value?.toString();
  const twitterDescription = fields?.TwitterDescription?.value?.toString();
  const twitterImage = resolveImageUrl(fields?.TwitterImage?.value?.src?.toString());
  const twitterSite = fields?.TwitterSite?.value?.toString();
  const contentTitle = getFieldValue(fields?.ContentTitle) || ogTitle;

  const canonical = Array.isArray(canonicalAlternates)
    ? canonicalAlternates.find((c) => c.IsCanonical)
    : null;

  useEffect(() => {
    const processPlaceholderScripts = (placeholderName: string, targetLocation: string) => {
      const placeholder = route?.placeholders[placeholderName];
      let html = '';

      if (placeholder && Array.isArray(placeholder)) {
        placeholder.forEach((rendering) => {
          if ((rendering as ComponentRendering).placeholders) {
            const placeholders = (rendering as ComponentRendering).placeholders;
            if (placeholders?.['sxa-metadata']) {
              const sxaMetadata = placeholders['sxa-metadata'];
              sxaMetadata.forEach((item) => {
                if ((item as ComponentRendering).fields) {
                  const fields = (item as ComponentRendering).fields;
                  if (fields?.Html && 'value' in fields.Html) {
                    // Add location marker to HTML content
                    html += `<!-- TARGET:${targetLocation} -->${fields.Html.value}`;
                  }
                }
              });
            }
          }
        });
      }

      return html;
    };

    // Use configurations from constants
    let allSnippetsHtml = '';
    ScriptPlaceholderConstants.placeholderConfigs.forEach((config) => {
      const html = processPlaceholderScripts(config.name, config.target);
      if (html) {
        allSnippetsHtml += html;
      }
    });

    setScriptsSnippetsHtml(allSnippetsHtml);
  }, [route]);

  const renderJsonLd = () => {
    const jsonLdArray = layoutData?.sitecore?.context?.jsonldschema;

    if (!jsonLdArray || !Array.isArray(jsonLdArray) || jsonLdArray.length === 0) {
      return null;
    }

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArray) }}
      />
    );
  };

  useEffect(() => {
    const loadDataLayerScript = async () => {
      if (layoutData?.sitecore?.context?.pageEditing) return;

      const currentPath = router.asPath;

      if (window.__dataLayerPushedPaths === currentPath) {
        return;
      }
      window.__dataLayerPushedPaths = currentPath;

      // --- REMOVE OLD SCRIPTS ---
      document.getElementById('datalayer-user-data-script')?.remove();
      document.getElementById('datalayer-page-data-script')?.remove();

      try {
        // --- USER DATA from API ---
        const res = await fetch('/api/proxy/datalayer/getdata');
        const data = await res.json();
        const userData = data?.DataLayer?.user;

        if (userData) {
          const userDataScript = document.createElement('script');
          userDataScript.id = 'datalayer-user-data-script';
          userDataScript.type = 'text/javascript';
          userDataScript.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            dataLayer.push({ user: ${JSON.stringify(userData)} });
          `;
          document.head.insertBefore(userDataScript, document.head.firstChild);
        }

        // --- PAGE DATA from Sitecore Context ---
        const pageData = (layoutData.sitecore.context.dataLayer as DataLayer)?.DataLayer?.page;

        if (pageData) {
          const pageDataScript = document.createElement('script');
          pageDataScript.id = 'datalayer-page-data-script';
          pageDataScript.type = 'text/javascript';
          pageDataScript.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            dataLayer.push({
              event: "page_view",
              page: ${JSON.stringify(pageData)}
            });
          `;
          document.body.appendChild(pageDataScript);
        }
      } catch (error) {
        localDebug.datalayer('Failed to load and inject data layer:', error);
      }
    };

    if (typeof window !== 'undefined') {
      loadDataLayerScript();
    }
  }, [router.asPath]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeAnalyticsTracking(siteName); // Click tracking & dynamic attributes
      populateTrackingFields(); // Populate hidden fields
      observeFormsForTracking();
    }
  }, []);

  const footerProps = route ? getFooterComponentProps(route) : null;

  const getFaviconUrl = (): string | undefined => {
    const faviconSrc = layoutData?.sitecore?.context?.favIconMediaUrl;
  
    if (typeof faviconSrc === 'string' && faviconSrc.trim().length > 0) {
      return resolveImageUrl(faviconSrc);
    }
    return undefined;
  };  

  const favIconUrl = getFaviconUrl();

  return (
    <>
      <Head>
        <title>{(route as CustomRouteData)?.browserTitle?.toString() || contentTitle}</title>
        {ogTitle && <meta property="og:title" content={ogTitle} />}
        {ogLocale && <meta property="og:locale" content={ogLocale} />}
        {ogUrl && <meta property="og:url" content={ogUrl} />}
        {ogDescription && <meta property="og:description" content={ogDescription} />}
        {ogImage && <meta property="og:image" content={ogImage} />}
        {ogType && <meta property="og:type" content={ogType} />}
        {ogSiteName && <meta property="og:site_name" content={ogSiteName} />}
        {ogAppId && <meta property="og:app_id" content={ogAppId} />}
        {ogAdmins && <meta property="og:admins" content={ogAdmins} />}
        {metaTitle && <meta name="title" content={metaTitle} />}
        {metaDescription && <meta name="description" content={metaDescription} />}
        {metaKeywords && <meta name="keywords" content={metaKeywords} />}
        {twitterType && <meta name="twitter:card" content={twitterType} />}
        {twitterSite && <meta name="twitter:site" content={twitterSite} />}
        {twitterTitle && <meta name="twitter:title" content={twitterTitle} />}
        {twitterDescription && <meta name="twitter:description" content={twitterDescription} />}
        {twitterImage && <meta name="twitter:image" content={twitterImage} />}
        {(canonicalAlternates as CanonicalAlternate[])?.map(
          (alternate, index: number) =>
            alternate?.HrefLang && (
              <link
                key={`alternate-${index}`}
                rel="alternate"
                href={alternate?.Href}
                hrefLang={alternate.HrefLang}
              />
            )
        )}
        {canonical && <link rel="canonical" href={canonical.Href} key="canonical" />}

        {robot && <meta name="robots" content={robot} />}

        <link rel="icon" href={favIconUrl ? favIconUrl : `${dynamicPublicUrl}/favicon.ico` } />
        <script
          type="text/javascript"
          src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
          async
        ></script>
        <script type="text/javascript" async src="https://play.vidyard.com/embed/v4.js"></script>
        {renderJsonLd()}
      </Head>

      <ScriptsInjector content={scriptsSnippets} isEditing={isPageEditing === true} />
      <TrustpilotWidgetRefresher />

      <VisitorIdentification />
      <PageViewTracker trackingDisabled={trackingDisabled}>
        <ModalProvider>
          <OverlayLinkHandler />
          {footerProps && <RegionSelectorModal {...footerProps} />}
          <div className={mainClassPageEditing}>
            <header>
              <div id="header">
                {route && <Placeholder name="gpn-headless-header" rendering={route} />}
              </div>
            </header>
            <main>
              <div id="content">
                {route && <Placeholder name="gpn-headless-main" rendering={route} />}
              </div>
            </main>
            <footer>
              <div id="footer">
                {route && <Placeholder name="gpn-headless-footer" rendering={route} />}
              </div>
            </footer>
          </div>
        </ModalProvider>
      </PageViewTracker>
    </>
  );
};

export default Layout;
