import { NextRequest, NextResponse } from 'next/server';
import { MiddlewarePlugin } from '..';
import { ReturnUrlCookieName } from '@/constants/appConstants';

class ReturnUrlCookiePlugin implements MiddlewarePlugin {
  async exec(req: NextRequest, res?: NextResponse): Promise<NextResponse> {
    debugger;
    const referer = req.headers.get('referer');
    const response = res || NextResponse.next();

    if (referer) {
      try {
        const refererUrl = new URL(referer);

        // Enforce same-origin
        if (refererUrl.origin !== req.nextUrl.origin) {
          return response;
        }

        // Strip query params except `utm_*`
        const filteredParams = new URLSearchParams();
        for (const [key, value] of refererUrl.searchParams.entries()) {
          if (key.startsWith('utm_')) {
            filteredParams.append(key, value);
          }
        }

        const cleanedPath =
          refererUrl.pathname + (filteredParams.toString() ? `?${filteredParams}` : '');
        debugger;
        const safeReturnUrl = `${req.nextUrl.origin}${cleanedPath}`;

        // Set secure cookie
        response.cookies.set(ReturnUrlCookieName, safeReturnUrl, {
          path: '/',
          httpOnly: false,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 300,
        });
      } catch {
        // Silently skip if referer is invalid
        return response;
      }
    }

    return response;
  }
}

export const setReturnUrlCookiePlugin = new ReturnUrlCookiePlugin();
