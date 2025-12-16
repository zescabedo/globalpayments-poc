const config = require('../../../temp/config');

/**
 * @param {import('next').NextConfig} nextConfig
 */
const corsHeaderPlugin = (nextConfig = {}) => {
  if (!config.corsDomains) {
    return nextConfig;
  }
  return Object.assign({}, nextConfig, {
    async headers() {
      const extendHeaders =
        typeof nextConfig.headers === 'function' ? await nextConfig.headers() : [];
      return [
        ...(await extendHeaders),
        {
          source: '/_next/:path*',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: config.corsDomains.replace(/\/$/, ''),
            },
          ],
        },
        {
          source: '/api/:path*',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: config.corsDomains.replace(/\/$/, ''),
            },
          ],
        },
      ];
    },
  });
};

module.exports = corsHeaderPlugin;
