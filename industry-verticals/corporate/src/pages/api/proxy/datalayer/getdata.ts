import type { NextApiRequest, NextApiResponse } from 'next';
import config from 'temp/config';
import localDebug from '@/lib/_platform/logging/debug-log';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const browserCookies = req.headers.cookie || '';
    const apiUrl = `${config.sitecoreApiHost}/gpnapi/datalayer/getuser`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: browserCookies,
      },
    });

    const contentType = response.headers.get('content-type');
    const responseText = await response.text();

    if (!response.ok) {
      localDebug.datalayer('Proxy request failed:', response.status, response.statusText);
      localDebug.datalayer('Response Body:', responseText);

      return res.status(response.status).json({
        error: 'Failed to fetch from Sitecore',
        responseText,
      });
    }

    if (contentType?.includes('application/json')) {
      const data = JSON.parse(responseText);
      return res.status(200).json(data);
    } else {
      return res.status(200).send(responseText);
    }
  } catch (error) {
    localDebug.datalayer('Proxy error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error });
  }
}
