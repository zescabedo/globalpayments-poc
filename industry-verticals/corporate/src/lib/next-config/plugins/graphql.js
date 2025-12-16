/**
 * @param {import('next').NextConfig} nextConfig
 */
const graphqlPlugin = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    webpack: (config, options) => {
      // graphql-let has been removed in JSS 22.7
      // If you need GraphQL code generation, use @graphql-codegen packages directly
      // See: https://the-guild.dev/graphql/codegen
    
      config.module.rules.push({
        test: /\.ya?ml$/,
        type: 'json',
        use: 'yaml-loader',
      });

      // Overload the Webpack config if it was already overloaded
      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    }
  });
};

module.exports = graphqlPlugin;
