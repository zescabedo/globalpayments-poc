import type { NextApiRequest, NextApiResponse } from 'next';
import config from 'temp/config';
import fetch from 'node-fetch';
import localDebug from '@/lib/_platform/logging/debug-log';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const reqCookies = req.headers.cookie || '';
    const response = await fetch(`${config.sitecoreApiHost}/gpnapi/tracking/giveconsent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: reqCookies, // Forward cookies to Sitecore
      },
    });

    if (!response.ok) {
      localDebug.gpn.error('Proxy request failed:', response.status, response.statusText);
      return res.status(response.status).end();
    }
    const resCookies = response.headers.raw()['set-cookie'];
    if (resCookies && resCookies.length > 0) {
      res.setHeader('Set-Cookie', resCookies);
    }
    return res.status(200).end();
  } catch (error) {
    localDebug.gpn.error('Proxy error:', error);
    return res.status(500).end();
  }
}
