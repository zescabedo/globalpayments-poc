import { NextRequest, NextResponse } from 'next/server';
import { MiddlewarePlugin } from '..';
import { OriginCookieName } from '@/constants/appConstants';

class OriginCookiePlugin implements MiddlewarePlugin {
  async exec(req: NextRequest, res?: NextResponse): Promise<NextResponse> {
    const forwardedProto = req.headers.get('x-forwarded-proto');
    const proto = forwardedProto ?? req.nextUrl.protocol.replace(':', '');

    const forwardedHost = req.headers.get('x-forwarded-host');
    const host = forwardedHost ?? req.headers.get('host') ?? req.nextUrl.host; // preserves port

    const origin = `${proto}://${host}`;
    const response = res || NextResponse.next();

    if (origin) {
      response.cookies.set(OriginCookieName, origin, {
        path: '/',
        sameSite: 'lax',
        secure: proto === 'https',
      });
    }

    return response;
  }
}

export const setOriginCookiePlugin = new OriginCookiePlugin();
