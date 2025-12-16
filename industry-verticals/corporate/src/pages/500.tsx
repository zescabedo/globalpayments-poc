import { SitecorePageProps } from 'lib/page-props';
import { sitecorePagePropsFactory } from 'lib/page-props-factory';
import { GetStaticProps } from 'next';
import SitecorePage from './[[...path]]';
import debug from '@/lib/_platform/logging/debug-log';
import { fetchErrorPagePath } from '@/utils/error-pages/errorPagesFetcher';

interface Custom500Props extends SitecorePageProps {
  statusCode: number;
  errorMessage?: string;
}

export const getStaticProps: GetStaticProps = async (context) => {
  let props = { notFound: false };
  const log = debug.gpn;

  try {
    const serverErrorPagePath = await fetchErrorPagePath(context.locale || 'en', '500');

    if (!serverErrorPagePath) {
      throw new Error('500 page path not found');
    }

    props = await sitecorePagePropsFactory.create({
      ...context,
      params: { ...context.params, path: serverErrorPagePath },
    });

    return {
      props,
      revalidate: 5,
      notFound: props.notFound,
    };
  } catch (error) {
    log(`Error occurred while fetching error pages: ${(error as Error).message}`);
    return {
      props: {
        statusCode: 500,
      },
      notFound: true,
    };
  }
};

/**
 * Custom 500 error page
 */
const Custom500Page = ({
  notFound,
  layoutData,
  componentProps,
  dictionary,
  site,
  locale,
}: Custom500Props): JSX.Element => {
  return (
    <SitecorePage
      notFound={notFound}
      layoutData={layoutData}
      componentProps={componentProps}
      dictionary={dictionary}
      locale={locale}
      site={site}
    />
  );
};

export default Custom500Page;
