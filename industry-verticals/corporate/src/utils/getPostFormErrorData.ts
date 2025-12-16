import { getSiteInfoByHostName } from './getSiteInfo';

export interface PostFormErrorData {
  FormData: {
    FormName: string;
    FormId: string;
    ContactId: string | null;
    SiteName: string;
  };
  UrlReferrer: string;
  Errors: Array<{
    Message: string;
    Origin: string;
    Status?: number | null;
  }>;
}
function getCookieValue(name: string): string {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : '';
}
export function getPostFormErrorData(status?: number, responseText?: string): PostFormErrorData {
  const formElement = document.querySelector(
    '[data-gpn-form-id][data-gpn-form-name]'
  ) as HTMLElement;

  const formId = formElement?.getAttribute('data-gpn-form-id') || '';
  const formName = formElement?.getAttribute('data-gpn-form-name') || '';
  const ctaValue =
    document.querySelector('[data-sc-field-name="origin_cta"]')?.getAttribute('data-origin-cta') ||
    '';
  const contactId = getCookieValue('SC_ANALYTICS_GLOBAL_COOKIE');

  const errorMessage = responseText || 'Forms validation failure';

  const hostName = window?.location?.host;
  const siteInfo = getSiteInfoByHostName(hostName);

  return {
    FormData: {
      FormName: formName,
      FormId: formId,
      ContactId: contactId || '',
      SiteName: siteInfo?.name || '',
    },
    UrlReferrer: ctaValue,
    Errors: [
      {
        Message: errorMessage,
        Origin: 'FrontEnd',
        Status: status || null,
      },
    ],
  };
}
