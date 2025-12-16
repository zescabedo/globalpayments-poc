import config from 'temp/config';
import {
  SitecoreProvider,
  ErrorPages,
} from '@sitecore-content-sdk/nextjs';
import client from 'lib/sitecore-client-factory';
import { SitecorePageProps } from 'lib/page-props';
import NotFound from 'src/NotFound';
import components from '.sitecore/component-map';
import Layout from 'src/Layout';
import { GetStaticProps } from 'next';
import { siteResolver } from 'lib/site-resolver';
import scConfig from 'sitecore.config';
import localDebug from '@/lib/_platform/logging/debug-log';

const Custom404 = (props: SitecorePageProps): JSX.Element => {
  localDebug.gpn('404 page props: %o', props);
  localDebug.gpn('404 page sitename: %s', siteResolver.getByName(config.sitecoreSiteName).name);
  
  // ContentSDK uses 'page' prop instead of 'layoutData'
  if (!(props && props.page)) {
    return <NotFound />;
  }
  
  return (
    <SitecoreProvider componentMap={components} api={scConfig.api} page={props.page}>
      <Layout page={props.page} />
    </SitecoreProvider>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const site = siteResolver.getByName(config.sitecoreSiteName);
  const siteName = site?.name ? site.name : 'CorporateHeadless';
  
  let resultErrorPages: ErrorPages | null = null;
  if (scConfig.generateStaticPaths) {
    try {
      resultErrorPages = await client.getErrorPages({
        site: siteName,
        locale: context.locale || config.defaultLanguage,
      });
    } catch (error) {
      localDebug.gpn.error('Error occurred while fetching error pages: %o', error);
      // Continue with null - will render fallback NotFound component
    }
  }
  
  // Convert error pages to page format if available
  const page = resultErrorPages?.notFoundPage ? {
    layout: resultErrorPages.notFoundPage.rendered,
    siteName,
    locale: context.locale || config.defaultLanguage,
  } : null;
  
  return {
    props: {
      page,
      notFound: !page,
    },
  };
};
export default Custom404;
