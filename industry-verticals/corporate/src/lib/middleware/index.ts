import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defineMiddleware } from '@sitecore-content-sdk/nextjs/middleware';
import { PLUGIN_EXECUTION_ORDER } from './plugin-order';
import localDebug from '@/lib/_platform/logging/debug-log';

// Add context interface for sharing data between plugins
export interface MiddlewareContext {
  // Locale-related data
  detectedLocale?: string;
  languageCookie?: string;
  siteLocale?: string;
  isDefaultLocale?: boolean;
  shouldHideDefaultLocale?: boolean;
  isRedirectProcessed?: boolean;

  // Geolocation-related data
  countryCode?: string;
  regionCode?: string;
  geoRedirectProcessed?: boolean;

  // General data that might be useful
  siteName?: string;
  originalPath?: string;

  // Method to safely set cookie values that other plugins can read
  setCookieForPlugins?: (name: string, value: string) => void;
  getCookieFromPlugins?: (name: string) => string | undefined;
}

export interface MiddlewarePlugin {
  /**
   * A middleware to be called, it's required to return @type {NextResponse} for other middlewares
   * @param req - The NextRequest object
   * @param res - The NextResponse object from previous middleware
   * @param context - Shared context between middleware plugins
   */
  exec(req: NextRequest, res?: NextResponse, context?: MiddlewareContext): Promise<NextResponse>;
}

// Use defineMiddleware from ContentSDK to wrap custom middleware logic
export default defineMiddleware(async (req: NextRequest): Promise<NextResponse> => {
  const response = NextResponse.next();

  localDebug.gpn('next middleware start');

  const start = Date.now();

  // Initialize shared context
  const context: MiddlewareContext = {
    // Helper methods for cookie management between plugins
    setCookieForPlugins: function (name: string, value: string) {
      if (name === 'language') {
        this.languageCookie = value;
      }
      // Add other cookie mappings as needed
    },
    getCookieFromPlugins: function (name: string): string | undefined {
      if (name === 'language') {
        return this.languageCookie;
      }
      // Add other cookie mappings as needed
      return undefined;
    },
  };

  // Execute plugins sequentially with early termination for redirects
  let finalRes = response;

  for (const plugin of PLUGIN_EXECUTION_ORDER) {
    try {
      finalRes = await plugin.exec(req, finalRes, context);

      // Check if the response is a redirect and should terminate early
      if (finalRes.status >= 300 && finalRes.status < 400) {
        localDebug.gpn('middleware redirect detected, terminating plugin chain');
        break;
      }

      // Check if context indicates redirect was processed
      if (context.isRedirectProcessed) {
        localDebug.gpn('middleware redirect processed flag set, terminating plugin chain');
        break;
      }
    } catch (error) {
      localDebug.gpn.error('middleware plugin error:', error);
      // Continue with next plugin on error
      continue;
    }
  }

  localDebug.gpn('next middleware end in %dms', Date.now() - start);

  return finalRes;
});
