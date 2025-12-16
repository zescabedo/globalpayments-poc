import type { NextApiRequest, NextApiResponse } from 'next';
import config from 'temp/config';
import localDebug from '@/lib/_platform/logging/debug-log';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const formId = req.body?.FormData?.FormId;
    if (!formId || typeof formId !== 'string' || formId.trim().length === 0) {
      return res.status(400).json({ error: 'FormId is required.' });
    }

    const browserCookies = req.headers.cookie || '';
    const apiUrl = `${config.sitecoreApiHost}/gpnapi/forms/processformuierrors`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: browserCookies,
      },
      body: JSON.stringify(req.body),
    });

    const contentType = response.headers.get('content-type');
    const responseText = await response.text();

    if (!response.ok) {
      localDebug.form('POST UI Errors proxy failed:', response.status, response.statusText);
      localDebug.form('Response Body:', responseText);

      return res.status(response.status).json({
        error: 'Failed to send UI errors to Sitecore',
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
    localDebug.form('Proxy error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
