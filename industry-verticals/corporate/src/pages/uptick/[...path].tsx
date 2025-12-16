import { useEffect } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import NotFound from 'src/NotFound';
import Layout from 'src/Layout';
import {
  RenderingType,
  SitecoreContext,
  ComponentPropsContext,
  EditingComponentPlaceholder,
  StaticPath,
} from '@sitecore-content-sdk/nextjs';
import { SitecorePageProps } from 'lib/page-props';
import { sitecorePagePropsFactory } from 'lib/page-props-factory';
import { componentBuilder } from 'temp/componentBuilder';

const SitecorePage = ({
  notFound,
  componentProps,
  layoutData,
}: SitecorePageProps): JSX.Element => {
  // Note: Experience Editor is not supported in XM Cloud - only Pages editor is available

  if (notFound || !layoutData || !layoutData?.sitecore?.route) {
    // Shouldn't hit this (as long as 'notFound' is being returned below), but just to be safe
    return <NotFound />;
  }

  const isEditing = layoutData.sitecore.context.pageEditing;
  const isComponentRendering =
    layoutData.sitecore.context.renderingType === RenderingType.Component;

  return (
    <>
      <ComponentPropsContext value={componentProps}>
        <SitecoreContext
          componentFactory={componentBuilder.getComponentFactory({ isEditing })}
          layoutData={layoutData}
        >
          {/*
            Sitecore Pages supports component rendering to avoid refreshing the entire page during component editing.
            If you are using Experience Editor only, this logic can be removed, Layout can be left.
          */}
          {isComponentRendering ? (
            <EditingComponentPlaceholder rendering={layoutData.sitecore.route} />
          ) : (
            <Layout layoutData={layoutData} />
          )}
        </SitecoreContext>
      </ComponentPropsContext>
    </>
  );
};

// This function gets called at build and export time to determine
// pages for SSG ("paths", as tokenized array).
export const getStaticPaths: GetStaticPaths = async () => {
  // Fallback, along with revalidate in getStaticProps (below),
  // enables Incremental Static Regeneration. This allows us to
  // leave certain (or all) paths empty if desired and static pages
  // will be generated on request (development mode in this example).
  // Alternatively, the entire sitemap could be pre-rendered
  // ahead of time (non-development mode in this example).
  // See https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration

  const paths: StaticPath[] = [];
  const fallback: boolean | 'blocking' = 'blocking';

  // if (process.env.NODE_ENV !== 'development' && !process.env.DISABLE_SSG_FETCH) {
  //   try {
  //     // Note: Next.js runs export in production mode
  //     if (process.env.SSG_STATIC_FILE_FETCH) {
  //       paths = await staticPathsProvider.loadPaths(context);
  //     } else {
  //       paths = await sitemapFetcher.fetch(context);
  //     }
  //   } catch (error) {
  //     console.log('Error occurred while fetching static paths');
  //     console.log(error);
  //   }

  //   fallback = process.env.EXPORT_MODE ? false : fallback;
  // }

  return {
    paths,
    fallback,
  };
};

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation (or fallback) is enabled and a new request comes in.
export const getStaticProps: GetStaticProps = async (context) => {
  const props = await sitecorePagePropsFactory.create(context);

  return {
    props,
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - Use shorter revalidation for 404s to prevent stale cache
    // - Normal pages: use STATIC_GENERATION_TTL for performance (can be 60-300+ seconds)
    // - 404 pages: always use 5 seconds for quick recovery after publishing
    revalidate: props.notFound ? 5 : parseInt(process.env.STATIC_GENERATION_TTL ?? '5'),
    notFound: props.notFound, // Returns custom 404 page with a status code of 404 when true
  };
};

export default SitecorePage;
