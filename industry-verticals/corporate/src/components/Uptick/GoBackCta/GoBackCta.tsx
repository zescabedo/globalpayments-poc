import Link from 'next/link';
import { GoBackProps } from './GoBackCta.types';
import { useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';
import { useEffect, useState } from 'react';
import { PreviousUrlCookieName, ReturnUrlCookieName } from '@/constants/appConstants';
import { usePathname } from 'next/navigation';
import { generateHomeUrl } from '@/utils/uptick/linkResolver';
import { useI18n } from 'next-localization';
import { formatTitle } from '@/utils/uptick/formatTitle';
import { useRouter } from 'next/router';

const GoBack = (props: GoBackProps) => {
  const { sitecoreContext } = useSitecoreContext();
  const { t } = useI18n();
  const pathname = usePathname();
  const [cookieUrl, setCookieUrl] = useState<string | null>(null);
  const propsFieldData = props?.fields?.data?.item;
  const router = useRouter();

  const label = propsFieldData?.backToLabel?.jsonValue?.value;
  const labelOverride = propsFieldData?.labelOverride?.jsonValue?.value;
  const hideWhenTargetIsHome = propsFieldData?.hideWhenTargetIsHome?.jsonValue?.value ?? false;

  const overrideUrl = propsFieldData?.linkOverride?.targetItem?.url?.path;

  const uptickHomePage = generateHomeUrl(sitecoreContext);

  if (pathname === uptickHomePage && hideWhenTargetIsHome) {
    return null;
  }

  useEffect(() => {
    if (!labelOverride) {
      setTimeout(() => {
        const cookies = document.cookie.split(';').map((c) => c.trim());
        const returnCookie = cookies.find((c) => c.startsWith(`${ReturnUrlCookieName}=`));
        const prevCookie = cookies.find((c) => c.startsWith(`${PreviousUrlCookieName}=`));
        if (returnCookie) {
          const returnUrl = decodeURIComponent(returnCookie.split('=')[1]);
          setCookieUrl(returnUrl);
        } else if (prevCookie) {
          const prevUrl = decodeURIComponent(prevCookie.split('=')[1]);
          setCookieUrl(prevUrl);
        }
      }, 0);
    }
  }, [labelOverride, router.asPath]);
  const previousPageName = cookieUrl?.split('/').filter(Boolean).pop() || '';
  const title = labelOverride || previousPageName || t('uptickhomepage');
  const uptickPage = (sitecoreContext as any)?.uptickConfiguration?.uptickHomePage;
  const url = labelOverride
    ? overrideUrl
    : cookieUrl || (title === t('uptickhomepage') ? uptickPage : '');

  return (
    <div className="component go-back" aria-label="Go Back">
      <div className="component-content">
        <div className="container">
          <Link href={url} className="go-back-wrapper">
            <span className="go-back-icon"></span>
            {`${label} ${formatTitle(title)}`}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GoBack;
