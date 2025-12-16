import localDebug from '@/lib/_platform/logging/debug-log';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  const targetHost = req.headers['x-target-host'] as string;

  // Whitelist allowed target hosts
  const allowedTargets = [
    'globalpaymentsinc.com',
    'www.globalpaymentsinc.com',
    // Add other legitimate target hosts here
    // 'legacy-site.example.com',
    // 'content-cdn.example.com',
  ];

  if (!targetHost) {
    return res.status(400).json({ error: 'Target host required' });
  }

  if (!allowedTargets.includes(targetHost)) {
    localDebug.geolocation(
      `[Proxy Rewrite] Blocked proxy attempt to unauthorized host: ${targetHost}`
    );
    return res.status(403).json({ error: 'Proxy target not allowed' });
  }

  localDebug.geolocation(`[Proxy Rewrite] Authorized proxy request to: ${targetHost}`);

  try {
    let actualPath = '';

    if (Array.isArray(path) && path.length > 0) {
      actualPath = path.join('/');
    } else if (typeof path === 'string') {
      actualPath = path;
    }

    const targetUrl = `https://${targetHost}/${actualPath}`;

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'User-Agent': req.headers['user-agent'] || '',
        Accept: req.headers['accept'] || '',
        'Accept-Language': req.headers['accept-language'] || '',
        'Cache-Control': req.headers['cache-control'] || '',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    localDebug.geolocation(`[Proxy Rewrite] Response status: ${response.status}`);

    // Validate content-type before processing
    const contentType = response.headers.get('content-type') || '';
    const isHtmlContent = contentType.toLowerCase().includes('text/html');

    if (!isHtmlContent) {
      localDebug.geolocation(
        `[Proxy Rewrite] Unsupported content type: ${contentType}. Only text/html is allowed.`
      );
      return res.status(415).json({
        error: 'Unsupported Media Type',
        message: 'Only HTML content is supported',
        contentType: contentType,
      });
    }

    localDebug.geolocation(`[Proxy Rewrite] Content type validation passed: ${contentType}`);

    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Forward response headers
    response.headers.forEach((value, key) => {
      // Skip certain headers that shouldn't be forwarded
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy failed' });
  }
}
