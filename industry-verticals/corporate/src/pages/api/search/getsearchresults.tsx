import { SearchApiConstants } from '@/constants/generalSearchConstants';
import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import config from 'temp/config';
interface SearchRequestBody {
  searchString?: string;
  pageNo?: number;
  pageSize?: number;
  language?: string;
  itemId?: string;
  siteName?: string;
  scopeQuery?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await NextCors(req, res, {
    origin: '*',
    methods: ['POST'],
    allowedHeaders: ['Content-Type'],
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      searchString = SearchApiConstants.defaultString,
      pageNo = SearchApiConstants.defaultPageNo,
      pageSize = SearchApiConstants.defaultPageSize,
      language = SearchApiConstants.defaultLanguage,
      itemId = SearchApiConstants.defaultString,
      siteName = SearchApiConstants.defaultString,
      scopeQuery = SearchApiConstants.defaultString,
    } = req.body as SearchRequestBody;

    // Validate input types
    if (typeof searchString !== 'string' || typeof language !== 'string') {
      return res
        .status(400)
        .json({ error: 'Invalid input: SearchString and Language must be strings' });
    }
    if (typeof itemId !== 'string') {
      return res.status(400).json({ error: 'Invalid input: Please pass a valid ItemId' });
    }
    if (typeof siteName !== 'string') {
      return res.status(400).json({ error: 'Invalid input: Please pass a valid SiteName' });
    }
    if (typeof scopeQuery !== 'string') {
      return res.status(400).json({ error: 'Invalid input: Please pass a valid ScopeQuery' });
    }
    if (!Number.isInteger(pageNo) || pageNo < 1) {
      return res.status(400).json({ error: 'Invalid PageNo: Must be a positive integer' });
    }
    if (!Number.isInteger(pageSize) || pageSize < 1) {
      return res.status(400).json({ error: 'Invalid PageSize: Must be a positive integer' });
    }

    const response = await fetch(`${config.sitecoreApiHost}/gpnapi/search/getsearchresults`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchString,
        pageNumber: pageNo,
        pageSize,
        language,
        itemId,
        siteName,
        scopeQuery,
      }),
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch search results' });
    }

    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
