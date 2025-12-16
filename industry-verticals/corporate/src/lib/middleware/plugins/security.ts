import { NextRequest, NextResponse } from 'next/server';
import { MiddlewarePlugin } from '..';
import { getSecuritySettings, type SecurityDirective } from '../../security/security-settings';
import { getSiteInfo } from '@/utils/getSiteInfo';
import { sites } from '@/utils/locales';
import localDebug from '@/lib/_platform/logging/debug-log';

/**
 * This plugin sets security headers based on Sitecore configuration.
 * It provides the authoritative, Sitecore-managed security policy.
 *
 * IMPORTANT: Only sets headers if not already present (to avoid duplicates with baseline headers).
 * The baseline headers from next.config.js serve as a fallback.
 */
class SecurityPlugin implements MiddlewarePlugin {
  async exec(req: NextRequest, res?: NextResponse): Promise<NextResponse> {
    const response = res || NextResponse.next();

    const siteInfo = getSiteInfo(req);
    const siteName = siteInfo?.name;
    const site = sites.find((site) => site.name.toLowerCase() === siteName?.toLowerCase());
    const siteDefaultLanguage = site?.defaultLanguage || 'en-US';

    // Fetch Sitecore-managed security settings
    const securitySettings = await getSecuritySettings(siteDefaultLanguage, req);

    localDebug.headlessInfra(
      `[Security Plugin] Fetched security settings for ${siteName}, language: ${siteDefaultLanguage}`
    );

    // Set security headers based on Sitecore settings or fallback to defaults

    const referrerPolicy =
      securitySettings?.referralPolicy?.results[0]?.policy?.jsonValue?.fields?.Value?.value ||
      'no-referrer';
    response.headers.set('Referrer-Policy', referrerPolicy);
    localDebug.headlessInfra(`[Security Plugin] Set Referrer-Policy: ${referrerPolicy}`);

    const xFrameOptions =
      securitySettings?.xFrameOptions?.results[0]?.xFrameOptions?.jsonValue?.fields?.Value?.value ||
      'SAMEORIGIN';
    response.headers.set('X-Frame-Options', xFrameOptions);
    localDebug.headlessInfra(`[Security Plugin] Set X-Frame-Options: ${xFrameOptions}`);

    if (securitySettings?.xContentTypeOptions?.results?.[0]?.enabled?.jsonValue?.value === true) {
      response.headers.set('X-Content-Type-Options', 'nosniff');
      localDebug.headlessInfra('[Security Plugin] Set X-Content-Type-Options: nosniff');
    }

    if (securitySettings?.xssProtection?.results?.[0]?.enabled?.jsonValue?.value === true) {
      response.headers.set('X-XSS-Protection', '1; mode=block');
      localDebug.headlessInfra('[Security Plugin] Set X-XSS-Protection: 1; mode=block');
    }

    const stsMaxAge = securitySettings?.strictTransportPolicy?.results?.[0]?.maxAge?.value;
    if (stsMaxAge) {
      const includeSubdomains =
        securitySettings.strictTransportPolicy.results[0].includesubdomains?.value === '1';
      const preload = securitySettings.strictTransportPolicy.results[0].preload?.value === '1';
      const stsValue = `max-age=${stsMaxAge}${includeSubdomains ? '; includeSubDomains' : ''}${
        preload ? '; preload' : ''
      }`;
      response.headers.set('Strict-Transport-Security', stsValue);
      localDebug.headlessInfra(`[Security Plugin] Set Strict-Transport-Security: ${stsValue}`);
    }

    // Build Sitecore-managed CSP directives
    const cspDirectives = securitySettings?.contentSecurityPolicy?.results?.[0]?.list?.results
      ?.map((directive: SecurityDirective) => {
        const name = directive?.name;
        const allowedHostsSources =
          directive?.allowedHosts?.jsonValue
            ?.map((h: { fields?: { Value?: { value: string } } }) => h?.fields?.Value?.value)
            .filter(Boolean) || [];
        const additionalHostsSources =
          directive?.additionalHosts?.value
            ?.split(/\s+/)
            .map((host: string) => host.trim())
            .filter(Boolean) || [];
        const sources = [...allowedHostsSources, ...additionalHostsSources].join(' ');
        return sources ? `${name} ${sources}` : '';
      })
      .filter(Boolean)
      .join('; ');

    localDebug.headlessInfra(
      `[Security Plugin] Built CSP directives: ${
        cspDirectives ? cspDirectives.substring(0, 100) + '...' : 'NONE'
      }`
    );

    // Set Sitecore-managed CSP when available (authoritative - overrides baseline)
    if (cspDirectives) {
      const headerName =
        securitySettings?.contentSecurityPolicy?.results?.[0]?.isReportOnly?.jsonValue?.value ===
        true
          ? 'Content-Security-Policy-Report-Only'
          : 'Content-Security-Policy';

      response.headers.set(headerName, cspDirectives);

      localDebug.headlessInfra(
        `[Security Plugin] Set ${headerName} from Sitecore (authoritative, overrides baseline)`
      );
    } else {
      localDebug.headlessInfra(
        '[Security Plugin] No Sitecore CSP directives available, baseline from next.config.js will apply'
      );
    }

    localDebug.headlessInfra('[Security Plugin] Execution complete');
    return response;
  }
}

export const securityPlugin = new SecurityPlugin();
