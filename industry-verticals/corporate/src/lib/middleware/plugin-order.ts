import { multisitePlugin } from './plugins/multisite';
import { redirectsPlugin } from './plugins/redirects';
import { securityPlugin } from './plugins/security';
import { normalizeUrlPlugin } from './plugins/normalizeUrl';
import { geolocationPlugin } from './plugins/geolocation';
import { ssrProxyPlugin } from './plugins/ssrProxy';
import { cleanupQueryPlugin } from './plugins/cleanupQuery';
import { setOriginCookiePlugin } from './plugins/setOriginCookie';
import { localePlugin } from './plugins/locale';
import { setReturnUrlCookiePlugin } from './plugins/setReturnUrlCookie';

export const PLUGIN_EXECUTION_ORDER = [
  multisitePlugin,
  localePlugin,
  redirectsPlugin,
  geolocationPlugin,
  normalizeUrlPlugin,
  ssrProxyPlugin,
  securityPlugin, // Moved after ssrProxy plugin as rewriting might be removing sensitive headers
  cleanupQueryPlugin,
  setOriginCookiePlugin,
  setReturnUrlCookiePlugin,
] as const;
