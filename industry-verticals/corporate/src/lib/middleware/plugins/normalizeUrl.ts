import { NextRequest, NextResponse } from 'next/server';
import { MiddlewarePlugin } from '..';

/**
 * This plugin normalizes URLs by:
 * 1. Converting to lowercase
 * 2. Converting spaces (%20) to hyphens
 * 3. Removing trailing hyphens
 * 4. Removing trailing slashes (except for homepage)
 */
class NormalizeUrlPlugin implements MiddlewarePlugin {
  async exec(req: NextRequest, res?: NextResponse): Promise<NextResponse> {
    const url = req.nextUrl.clone();
    let path = url.pathname;
    let shouldRedirect = false;

    // 1. Convert URL to lowercase
    if (path !== path.toLowerCase()) {
      path = path.toLowerCase();
      shouldRedirect = true;
    }

    // 2. Convert %20 to hyphens
    if (path.includes('%20')) {
      path = path.replace(/%20/g, '-');
      shouldRedirect = true;
    }

    // 3. Remove trailing hyphens
    if (path.endsWith('-')) {
      path = path.slice(0, -1);
      shouldRedirect = true;
    }

    // 4. Remove trailing slashes (except for homepage)
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
      shouldRedirect = true;
    }

    // If any changes were made, redirect to the cleaned URL
    if (shouldRedirect) {
      url.pathname = path;
      return NextResponse.redirect(url);
    }

    // Pass through to next middleware if no redirect needed
    return res || NextResponse.next();
  }
}

export const normalizeUrlPlugin = new NormalizeUrlPlugin();
