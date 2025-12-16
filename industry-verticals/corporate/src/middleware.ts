import type { NextRequest } from 'next/server';
import middleware from 'lib/middleware';
// eslint-disable-next-line
export default async function (req: NextRequest) {
  return middleware(req);
}
export const config = {
  /*
   * Match all paths except for:
   * 1. /api routes
   * 2. /_next (Next.js internals)
   * 3. /sitecore/api (Sitecore API routes)
   * 4. /- (Sitecore media)
   * 5. /healthz (Health check)
   * 6. all root files inside /public
   * 7. dynamic ssr routes
   * 8. /.well-known (Well-known URIs)
   * 9. /layouts (Layouts directory)
   * 10. /sitemap routes (Sitemap routes)
   */
  matcher: [
    '/',
    // Exclude SSR routes and other paths
    '/((?!api/|_next/|styles/|ssr-routes/.*|healthz|sitecore/api/|-/|favicon.ico|sc_logo.svg|site.css|\\.well-known/|layouts/|.*sitemap\\.xml).*)',
  ],
};
