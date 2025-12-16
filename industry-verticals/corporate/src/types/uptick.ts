export type ContentType =
  | 'article'
  | 'case-study'
  | 'ebook'
  | 'news'
  | 'podcast'
  | 'webinar'
  | 'video'
  | 'calculator'
  | 'infographic'
  | 'original-research'
  | 'quiz';

/*export interface AuthorRef {
  id: string;
  slug: string;
  name: string;
  photoUrl?: string;
}*/

/*export interface UptickItem {
  id: string;
  slug: string;
  path: string;
  title: string;
  summary?: string;
  mainImageUrl?: string;
  cardImageUrl?: string;
  contentType: ContentType | string;
  tags: string[];
  topics: string[];
  categories: string[];
  industries: string[];
  publishedDate?: string;
  authors: AuthorRef[];
  href?: string; // prebuilt link for card usage
}*/

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}
