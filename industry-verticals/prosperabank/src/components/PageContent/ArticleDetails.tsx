import React, { JSX } from 'react';
import {
  Field,
  ImageField,
  Placeholder,
  Text,
  RichText,
  RichTextField,
  NextImage,
  Link,
  LinkField,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { ParallaxBackgroundImage } from 'components/NonSitecore/ParallaxBackgroundImage';
import Head from 'next/head';

interface CategoryItem {
  id?: string;
  name?: string;
  url?: {
    path?: string;
  };
  fields?: {
    Title?: Field<string>;
  };
  displayName?: string;
}

interface Fields {
  Title: Field<string>;
  Excerpt: Field<string>;
  Content: RichTextField;
  Thumbnail: ImageField;
  BackgroundImage: ImageField;
  Name: Field<string>;
  Photo: ImageField;
  Position: Field<string>;
  Button?: LinkField;
  Category?: CategoryItem[] | Field<string>;
}

export type PageBackgroundProps = ComponentProps & {
  fields: Fields;
};

export const Default = (props: PageBackgroundProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  return (
    <>
      <Head>
        <meta property="og:description" content={props.fields?.Excerpt.value} />
        <meta property="og:name" content={props.fields?.Title?.value} />
        <meta property="og:title" content={props.fields?.Title?.value} />
        <meta property="og:image" content={props.fields?.Thumbnail?.value?.src} />
        <meta property="og:type" content="article" />
      </Head>
      <div
        className={`component article-details page-background spaced-top col-12 ${props.params?.styles?.trimEnd()}`}
        id={id ? id : undefined}
      >
        <ParallaxBackgroundImage BackgroundImage={props.fields.BackgroundImage} />

        <div className="container">
          <Placeholder name="page-navigation" rendering={props.rendering} />
        </div>

        <div>
          <div className="background-content component-spaced container rounded-corners">
            <div className="p-3 p-sm-5">
              <div className="article-content">
                <div className="row row-gap-4 gx-5 align-items-start">
                  <div className="col-12 col-lg-6">
                    <div className="article-thumbnail-wrapper">
                      <NextImage
                        field={props.fields.Thumbnail}
                        className="article-img img-fluid"
                        width={600}
                        height={400}
                      />
                    </div>
                  </div>
                  <div className="col-12 col-lg-6">
                    <div className="article-header-content">
                      {(() => {
                        const categories = props.fields.Category;
                        if (!categories) return null;
                        
                        // Handle array of category items
                        if (Array.isArray(categories) && categories.length > 0) {
                          return (
                            <div className="category-buttons">
                              {categories.map((category, index) => {
                                const categoryName = category.fields?.Title?.value || category.name || category.displayName || '';
                                const categoryUrl = category.url?.path || '#';
                                const categoryId = category.id || `category-${index}`;
                                // Alternate hover colors: even index = blue, odd index = orange
                                const hoverColorClass = index % 2 === 0 ? 'category-button-hover-blue' : 'category-button-hover-orange';
                                
                                return (
                                  <a
                                    key={categoryId}
                                    href={categoryUrl}
                                    className={`category-button ${hoverColorClass}`}
                                  >
                                    {categoryName}
                                  </a>
                                );
                              })}
                            </div>
                          );
                        }
                        
                        // Show in editing mode even if empty
                        if (isPageEditing) {
                          return (
                            <div className="category-buttons">
                              <span className="category-button category-button-hover-blue">Category</span>
                            </div>
                          );
                        }
                        
                        return null;
                      })()}
                      <h1 className="article-title">
                        <Text field={props.fields.Title} />
                      </h1>
                      {(isPageEditing || props.fields.Excerpt?.value) && (
                        <p className="article-excerpt">
                          <Text field={props.fields.Excerpt} />
                        </p>
                      )}
                      {(isPageEditing || (props.fields.Button?.value?.href && props.fields.Button?.value?.text)) && props.fields.Button && (
                        <div className="article-button-wrapper mt-4">
                          <Link field={props.fields.Button} className="btn btn-cta-primary btn-sm">
                            {props.fields.Button?.value?.text || 'Button'}
                          </Link>
                        </div>
                      )}
                      <div className="row mt-4">
                        <Placeholder name="article-meta" rendering={props.rendering} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="article-content-body mt-5">
                  <RichText field={props.fields.Content} />
                </div>
              </div>
              <div className="row">
                <Placeholder name="background-page-content" rendering={props.rendering} />
              </div>
            </div>
          </div>
          <Placeholder name="page-content" rendering={props.rendering} />
        </div>
      </div>
    </>
  );
};

export const Simple = (props: PageBackgroundProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  return (
    <>
      <Head>
        <meta property="og:description" content={props.fields?.Excerpt.value} />
        <meta property="og:name" content={props.fields?.Title?.value} />
        <meta property="og:title" content={props.fields?.Title?.value} />
        <meta property="og:image" content={props.fields?.Thumbnail?.value?.src} />
        <meta property="og:type" content="article" />
      </Head>
      <div
        className={`component simple-article-details mt-4 ${props.params?.styles?.trimEnd()}`}
        id={id ? id : undefined}
      >
        <div className="container container-wide">
          <h1 className="article-title display-xxl">
            <Text field={props.fields.Title} />
          </h1>
        </div>
        <div className="container container-widest-fluid">
          <NextImage
            field={props.fields.Thumbnail}
            className="article-img img-fluid"
            width={1650}
            height={750}
          />
        </div>
        <div className="container">
          <div className="article-content">
            <div className="row">
              <div className="col-12 col-lg-6 mx-auto">
                <p className="article-excerpt body-md">
                  <Text field={props.fields.Excerpt} />
                </p>
                <div className="article-content-body rich-text mt-5">
                  <RichText field={props.fields.Content} />
                </div>
                <div className="row article-meta-row">
                  <Placeholder name="article-meta" rendering={props.rendering} />
                </div>
              </div>
            </div>
          </div>
          <div className="row mt-5">
            <Placeholder name="background-page-content" rendering={props.rendering} />
          </div>
        </div>
        <div className="row">
          <Placeholder name="page-content" rendering={props.rendering} />
        </div>
      </div>
    </>
  );
};
