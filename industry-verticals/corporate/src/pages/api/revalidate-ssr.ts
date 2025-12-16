import { NextApiRequest, NextApiResponse } from 'next';
import localDebug from '@/lib/_platform/logging/debug-log';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Log complete request details
  localDebug.ssrRouting('[SSR Routing] Revalidation request received');
  localDebug.ssrRouting('[SSR Routing] Request method: %s', req.method);
  localDebug.ssrRouting('[SSR Routing] Request URL: %s', req.url);
  localDebug.ssrRouting('[SSR Routing] Request query: %o', req.query);

  // Log headers (sanitize any sensitive ones)
  const safeHeaders = { ...req.headers };
  if (safeHeaders.authorization) {
    safeHeaders.authorization = '[REDACTED]';
  }
  if (safeHeaders['x-api-key']) {
    safeHeaders['x-api-key'] = '[REDACTED]';
  }
  localDebug.ssrRouting('[SSR Routing] Request headers: %o', safeHeaders);

  // Log client info
  localDebug.ssrRouting(
    '[SSR Routing] Client IP: %s',
    req.headers['x-forwarded-for'] || req.socket.remoteAddress
  );

  if (req.method !== 'POST') {
    localDebug.ssrRouting('[SSR Routing] Method not allowed: %s', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.headers['x-api-key'];
  localDebug.ssrRouting('[SSR Routing] Auth token present: %s', !!token);
  localDebug.ssrRouting('[SSR Routing] Expected token present: %s', !!process.env.SITECORE_API_KEY);

  if (token !== process.env.SITECORE_API_KEY) {
    localDebug.ssrRouting('[SSR Routing] Unauthorized - token mismatch');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { language, siteName } = req.query;
    localDebug.ssrRouting('[SSR Routing] Params - language: %s, siteName: %s', language, siteName);

    if (!siteName || typeof siteName !== 'string') {
      localDebug.ssrRouting('[SSR Routing] Missing siteName parameter');
      return res.status(400).json({ message: 'Valid SiteName is required' });
    }

    let revalidationPath = `/ssr-routes/${siteName}/get-ssr-routes`;

    if (language) {
      revalidationPath = `/${language}${revalidationPath}`;
    }

    localDebug.ssrRouting('[SSR Routing] Revalidation path: %s', revalidationPath);

    // Log before revalidation attempt
    localDebug.ssrRouting('[SSR Routing] Attempting to revalidate path');

    await res.revalidate(revalidationPath);
    localDebug.ssrRouting('[SSR Routing] Revalidation successful');
    return res.json({ revalidated: true });
  } catch (error) {
    localDebug.ssrRouting('[SSR Routing] Error revalidating SSR routes: %o', error);
    return res.status(500).json({
      message: 'Error revalidating cache',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
