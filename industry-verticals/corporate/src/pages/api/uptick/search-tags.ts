import type {
  ContentListingResult,
  SearchConditionInput,
} from '@/components/layout/SearchTagResults/SearchTagResults.type';
import localDebug from '@/lib/_platform/logging/debug-log';
import { executeGraphQL } from '@/lib/graphql/fetchGraphQL';
import { getContentTagsQuery } from '@/queries/getContentListing';
import type { NextApiRequest, NextApiResponse } from 'next';

type RequestBody = {
  pageSize?: number;
  language?: string | null;
  audienceBlock?: SearchConditionInput[];
  requestId?: string;
  after: string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContentListingResult | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pageSize, language, audienceBlock, after } = req.body as RequestBody;
    const query = getContentTagsQuery(audienceBlock);
    const result = await executeGraphQL<ContentListingResult>(query, { pageSize, language, after });
    return res.status(200).json(result);
  } catch (error) {
    localDebug.uptick.debug(
      'error:',
      error instanceof Error ? error.message : 'Internal server error'
    );
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
