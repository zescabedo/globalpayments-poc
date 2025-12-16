import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { PreviousUrlCookieName } from '@/constants/appConstants';

// Allow any query params starting with `utm_`
const isWhitelistedParam = (key: string) => key.startsWith('utm_');

export const usePreviousUrlCookie = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const prevPath = sessionStorage.getItem('previousPath');

    // Skip if no previous path or navigating to same page
    if (prevPath && prevPath !== pathname) {
      try {
        const prevUrl = new URL(prevPath, window.location.origin);

        // Enforce same-origin
        if (prevUrl.origin !== window.location.origin) return;

        // Strip unwanted query params (keep only whitelisted)
        const filteredParams = new URLSearchParams();
        for (const [key, value] of prevUrl.searchParams.entries()) {
          if (isWhitelistedParam(key)) {
            filteredParams.append(key, value);
          }
        }

        const cleanedPath =
          prevUrl.pathname + (filteredParams.toString() ? `?${filteredParams}` : '');
        const safeUrl = window.location.origin + cleanedPath;

        // Set the cookie
        document.cookie = `${PreviousUrlCookieName}=${encodeURIComponent(
          safeUrl
        )}; path=/; max-age=300`;
      } catch {
        // Silently fail
      }
    }

    // Store current path as "previous" for the next run
    const currentPathWithQuery = pathname + (searchParams?.toString() ? `?${searchParams}` : '');
    sessionStorage.setItem('previousPath', currentPathWithQuery);
  }, [pathname, searchParams]);
};
