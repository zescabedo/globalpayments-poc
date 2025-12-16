import { SiteInfo } from '@sitecore-content-sdk/nextjs';
import { editingDataService } from '@sitecore-content-sdk/nextjs/editing';
import { SitecorePageProps } from 'lib/page-props';
import { GetServerSidePropsContext, GetStaticPropsContext } from 'next';
import { Plugin } from '..';
import localDebug from '@/lib/_platform/logging/debug-log';

class PreviewModePlugin implements Plugin {
  order = 1;

  async exec(props: SitecorePageProps, context: GetServerSidePropsContext | GetStaticPropsContext) {
    if (!context.preview) return props;

    // If we're in preview (editing) mode, use data already sent along with the editing request
    try {
      const data = await editingDataService.getEditingData(context.previewData);
      if (!data) {
        localDebug.gpn.error(
          `Unable to get editing data for preview ${JSON.stringify(context.previewData)}`
        );
        props.notFound = true;
        return props;
      }

      props.site = data.layoutData.sitecore.context.site as SiteInfo;
      props.locale = data.language;
      props.layoutData = data.layoutData;
      props.dictionary = data.dictionary;
    } catch (error) {
      localDebug.gpn.error('Failed to fetch editing data:', error);
      props.notFound = true;
    }

    return props;
  }
}

export const previewModePlugin = new PreviewModePlugin();
