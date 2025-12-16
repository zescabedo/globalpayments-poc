import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';

/**
 * Rendered in case if we have 404 error
 */
const NotFound = (): JSX.Element => {
  // Track 404 events for analytics and debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Log to console for debugging
      console.warn('[404] Page not found:', window.location.pathname);
    }
  }, []);

  return (
    <>
      <Head>
        <title>404: Page Not Found</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="not-found-page">
        <div className="container">
          <h1>404 - Page Not Found</h1>
          <p>We couldn&apos;t find the page you were looking for.</p>
          <p>
            <Link href="/" className="btn btn-primary">
              Return to Home Page
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default NotFound;
