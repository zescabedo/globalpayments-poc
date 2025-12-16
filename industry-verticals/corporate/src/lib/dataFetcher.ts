import { AxiosDataFetcher } from '@sitecore-jss/sitecore-jss-nextjs';

interface HttpResponse<T> {
  data: T;
  statusCode: number;
  headers: Headers;
  status: number;
  statusText: string;
}

export const dataFetcher = async <T>(url: string, data?: unknown): Promise<HttpResponse<T>> => {
  const axiosFetcher = new AxiosDataFetcher();
  const response = await axiosFetcher.fetch<T>(url, data);

  return {
    data: response.data,
    statusCode: response.status,
    headers: new Headers(response.headers),
    status: response.status,
    statusText: response.statusText,
  };
};
