import { NextRequest } from 'next/server';
import { siteResolver } from 'lib/site-resolver';
import localDebug from '@/lib/_platform/logging/debug-log';

export function getSiteInfo(req: NextRequest) {
  const hostname = req?.headers?.get('x-forwarded-host') || req?.nextUrl?.hostname;

  localDebug.headlessInfra(`[Site Info]: hostname found in getSiteInfo: ${hostname}`);

  const sites = siteResolver.sites || [];
  const site = sites.find((s) => {
    const hostNames = s.hostName.split('|');
    return hostNames.some((host) => host.trim() === hostname);
  });

  localDebug.headlessInfra(`[Site Info]: site found in getSiteInfo: ${JSON.stringify(site)}`);

  return site;
}

export function getSiteInfoByHostName(hostname: string) {
  localDebug.headlessInfra(`[Site Info]: hostname found in getSiteInfoByHostName: ${hostname}`);

  const sites = siteResolver.sites || [];

  // Normalize input hostname (case-insensitive, strip port if localhost)
  let normalizedHost = hostname.toLowerCase();

  // Special handling for localhost: strip port (e.g., localhost:3000 → localhost)
  if (normalizedHost.startsWith('localhost')) {
    normalizedHost = normalizedHost.split(':')[0];
  }

  const site = sites.find((s) => {
    const hostNames = s.hostName.split('|');
    return hostNames.some((host) => {
      const normalizedConfigHost = host.trim().toLowerCase();

      // If config entry is "localhost" → match "localhost" regardless of port
      if (normalizedConfigHost.startsWith('localhost')) {
        return normalizedHost === 'localhost';
      }

      // Otherwise require exact match (case-insensitive)
      return normalizedConfigHost === normalizedHost;
    });
  });

  localDebug.headlessInfra(
    `[Site Info]: site found in getSiteInfoByHostName: ${JSON.stringify(site)}`
  );

  return site;
}
