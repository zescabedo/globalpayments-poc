import { FormAPI } from '@/constants/appConstants';
import { PostFormErrorData } from './getPostFormErrorData';

export async function postUiErrorToCosmos(errorPayload: PostFormErrorData) {
  const url = FormAPI.postUIErrorAPIPath;
  const payload = JSON.stringify(errorPayload);

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon(url, blob);
  } else {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    });
  }
}
