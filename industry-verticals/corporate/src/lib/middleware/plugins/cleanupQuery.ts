import { NextRequest, NextResponse } from 'next/server';
import { MiddlewarePlugin } from '..';

export class CleanupQueryPlugin implements MiddlewarePlugin {
  async exec(_req: NextRequest, res?: NextResponse): Promise<NextResponse> {
    const response = res || NextResponse.next();

    const location = response.headers.get('location');
    if (location && location.includes('path=')) {
      const url = new URL(location);
      url.searchParams.delete('path');
      response.headers.set('location', url.toString());
    }

    return response;
  }
}

export const cleanupQueryPlugin = new CleanupQueryPlugin();
