/* eslint-disable @next/next/no-css-tags */
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { I18nProvider } from 'next-localization';
import { SitecorePageProps } from 'lib/page-props';
import Bootstrap from 'src/Bootstrap';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import { siteToThemeMap } from 'constants/siteToThemeMap';
import jssConfig from '../temp/config';
import { usePreviousUrlCookie } from '@/utils/uptick/usePreviousUrlCookie';

function App({ Component, pageProps }: AppProps<SitecorePageProps>): JSX.Element {
  const { dictionary, ...rest } = pageProps;
  usePreviousUrlCookie();

  useEffect(() => {
    AOS.init();
  }, []);

  const siteName = pageProps.site?.name;
  const stylesheetName = siteToThemeMap[siteName];

  // choose the stylesheet for this site name, fall back to base theme
  const stylesheet = stylesheetName ? `${stylesheetName}.css` : 'global.css';
  // this is needed for when the app is loaded in EE
  const publicUrl = jssConfig?.publicUrl ? jssConfig.publicUrl : '';

  return (
    <>
      <Head>
        <link rel="stylesheet" href={`${publicUrl}/styles/${stylesheet}`} fetchPriority="high" />
      </Head>
      <Bootstrap {...pageProps} />
      {/*
        // Use the next-localization (w/ rosetta) library to provide our translation dictionary to the app.
        // Note Next.js does not (currently) provide anything for translation, only i18n routing.
        // If your app is not multilingual, next-localization and references to it can be removed.
      */}
      <I18nProvider lngDict={dictionary} locale={pageProps.locale}>
        <Component {...rest} />
      </I18nProvider>
    </>
  );
}

export default App;
