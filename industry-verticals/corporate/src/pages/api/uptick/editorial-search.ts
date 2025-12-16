import { executeGraphQL } from '@/lib/graphql/fetchGraphQL';
import { generateRequestId } from '@/lib/uptick/errors';
import {
  getUptickSearchQuery,
  getUptickSuggestionQuery,
  getUptickTotalItems,
} from '@/queries/getEditorialHeroSearchQuery';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('req.method: ', req.method);
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { type, language, term, pageSize } = req.body;
  const requestId = req.headers['x-request-id'] || generateRequestId();
  const startTime = Date.now();

  try {
    let data;

    switch (type) {
      case 'suggestions':
        if (!term || !language) {
          return res.status(400).json({ error: 'Missing required fields: term, language' });
        }
        data = await executeGraphQL(getUptickSuggestionQuery(), { term, language });
        break;

      case 'searchTotal':
        if (!term || !language) {
          return res.status(400).json({ error: 'Missing required fields: term, language' });
        }
        data = await executeGraphQL(getUptickTotalItems(), { pageSize: 2, language, term });
        break;

      case 'search':
        if (!term || !language || !pageSize) {
          return res.status(400).json({ error: 'Missing required fields: term, language' });
        }
        data = await executeGraphQL(getUptickSearchQuery(), { pageSize, language, term });
        break;

      default:
        return res
          .status(400)
          .json({ error: 'Invalid type. Must be: suggestions, slugSuggestions, or search' });
    }

    const processingTime = Date.now() - startTime;

    return res.status(200).json({
      data,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTime: `${processingTime}ms`,
      },
    });
  } catch (error) {
    console.error('Uptick API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      meta: { requestId },
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
