import React, { JSX } from 'react';
import {
  ComponentParams,
  ComponentRendering,
  Field,
  ImageField,
  Text,
  RichTextField,
  withDatasourceCheck,
  NextImage,
} from '@sitecore-content-sdk/nextjs';
import Link from 'next/link';
import { useI18n } from 'next-localization';

interface Fields {
  Title: Field<string>;
  Excerpt: Field<string>;
  Content: RichTextField;
  Thumbnail: ImageField;
  BackgroundImage: ImageField;
  Name: Field<string>;
  Photo: ImageField;
  Position: Field<string>;
}

export type ArticleListItemProps = {
  fields: Fields;
  name: string;
  url: string;
};

interface ArticleListComponentProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: {
    items: ArticleListItemProps[];
  };
}

const getNewsItems = (items: ArticleListItemProps[], numOfItems: number) => {
  return items
    ?.filter((item) => item.name !== 'Data' && item.name !== 'Authors')
    .slice(0, numOfItems || undefined);
};

const getAllArticlesPageHref = (items: ArticleListItemProps[]) => {
  return items?.find((item) => item.name === 'Data')?.url.replace(/\/Data$/, '') || '#';
};

const ArticleListDefault = (props: ArticleListComponentProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const newsItems = getNewsItems(props.fields?.items, parseInt(props.params?.NumberOfItems));

  // Group items into sets of 4 (1 featured + 3 smaller)
  const groupedItems: ArticleListItemProps[][] = [];
  for (let i = 0; i < newsItems.length; i += 4) {
    groupedItems.push(newsItems.slice(i, i + 4));
  }

  return (
    <div
      className={`component article-list ${props.params?.styles.trimEnd()}`}
      id={id ? id : undefined}
    >
      <div className="container">
        {groupedItems.map((group, groupIndex) => (
          <div
            key={`group-${groupIndex}`}
            className={`article-list-group ${groupIndex > 0 ? 'mt-5' : ''}`}
          >
            <div className="row gx-4 gx-lg-5">
              {/* Large featured article on the left */}
              {group[0] && (
                <div className="col-lg-7 mb-4 mb-lg-0">
                  <article className="article-featured h-100">
                    <Link href={group[0].url} className="article-featured-link">
                      <div className="article-featured-image mb-3">
                        <NextImage
                          field={group[0].fields.Thumbnail}
                          width={800}
                          height={500}
                          className="w-100"
                        />
                      </div>
                      <div className="article-featured-content">
                        <h2 className="article-featured-title title-lg mb-2">
                          <Text field={group[0].fields.Title} />
                        </h2>
                        {group[0].fields.Excerpt?.value && (
                          <p className="article-featured-excerpt body-md mb-3">
                            <Text field={group[0].fields.Excerpt} />
                          </p>
                        )}
                      </div>
                    </Link>
                  </article>
                </div>
              )}

              {/* Three smaller articles stacked on the right */}
              <div className="col-lg-5">
                <div className="article-list-small d-flex flex-column gap-4 h-100">
                  {group.slice(1, 4).map((item) => (
                    <article key={item.url} className="article-small">
                      <Link href={item.url} className="article-small-link d-flex gap-3">
                        <div className="article-small-image flex-shrink-0">
                          <NextImage
                            field={item.fields.Thumbnail}
                            width={200}
                            height={150}
                            className="article-small-img"
                          />
                        </div>
                        <div className="article-small-content flex-grow-1">
                          <h3 className="article-small-title title-xs mb-2">
                            <Text field={item.fields.Title} />
                          </h3>
                          {item.fields.Excerpt?.value && (
                            <p className="article-small-excerpt body-sm text-muted d-none d-md-block">
                              <Text field={item.fields.Excerpt} />
                            </p>
                          )}
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ArticleListThreeColumn = (props: ArticleListComponentProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const newsItems = getNewsItems(props.fields?.items, parseInt(props.params?.NumberOfItems));
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div
      className={`component component-spaced article-list ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="row row-gap-3">
          {newsItems?.map((item) => (
            <div className="col-lg-4" key={item.url}>
              <Link href={item.url} className="wrapper-link">
                <NextImage field={item.fields.Thumbnail} width={400} height={300} />
                <h3 className="title-xs mt-3">
                  <Text field={item.fields.Title}></Text>
                </h3>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ArticleListSimplified = (props: ArticleListComponentProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const newsItems = getNewsItems(props.fields?.items, parseInt(props.params?.NumberOfItems));
  const allArticlesPageHref = getAllArticlesPageHref(props.fields?.items);
  const { t } = useI18n();
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div
      className={`component component-spaced article-list ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="row align-items-center">
          <div className="col">
            <div className="title display-md">{t('News') || 'News'}</div>
          </div>
          <div className="col-auto learn-more">
            <Link href={allArticlesPageHref} className="btn btn-link btn-md">
              {t('See all') || 'See all'} <i className="fa fa-angle-right" />
            </Link>
          </div>
        </div>

        <div className="background p-3 p-sm-5">
          {newsItems?.map((item, i) => (
            <React.Fragment key={item.url}>
              <div className="row gx-5 row-gap-3 align-items-center">
                <div className="col-lg-4">
                  <NextImage field={item.fields.Thumbnail} width={400} height={300} />
                </div>

                <div className="col-lg-6">
                  <h3 className="title-xs">
                    <Text field={item.fields.Title}></Text>
                  </h3>
                  <p className="body-md">
                    <Text field={item.fields.Excerpt}></Text>
                  </p>
                  <Link href={item.url} className="btn btn-link btn-md">
                    {t('Read more') || 'Read more'}
                  </Link>
                </div>
              </div>
              {i === newsItems.length - 1 ? <></> : <hr />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

const ArticleListGrid = (props: ArticleListComponentProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const newsItems = getNewsItems(props.fields?.items, parseInt(props.params?.NumberOfItems));
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div
      className={`component component-spaced article-list ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container container-wide">
        <div className="article-list-grid">
          {newsItems?.map((item) => (
            <div className="article-grid-item" key={item.url}>
              <Link href={item.url} className="wrapper-link">
                <NextImage field={item.fields.Thumbnail} width={800} height={400} />
                <h3 className="title-xs mt-3">
                  <Text field={item.fields.Title}></Text>
                </h3>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Default = withDatasourceCheck()<ArticleListComponentProps>(ArticleListDefault);
export const ThreeColumn = withDatasourceCheck()<ArticleListComponentProps>(ArticleListThreeColumn);
export const Simplified = withDatasourceCheck()<ArticleListComponentProps>(ArticleListSimplified);
export const Grid = withDatasourceCheck()<ArticleListComponentProps>(ArticleListGrid);
