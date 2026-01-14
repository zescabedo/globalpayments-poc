import React, { JSX, useState } from 'react';
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
import GatedResourceModal from 'components/NonSitecore/GatedResourceModal';

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
  Title?: Field<string>;
  Excerpt?: Field<string>;
  Content?: RichTextField;
  Thumbnail?: ImageField;
  BackgroundImage?: ImageField;
  Name?: Field<string>;
  Photo?: ImageField;
  Position?: Field<string>;
  Button?: LinkField;
  IsGatedLink?: Field<boolean>;
  Category?: CategoryItem[] | Field<string>;
}

export type PageBackgroundProps = ComponentProps & {
  fields?: Fields;
};

export const Default = (props: PageBackgroundProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  
  // Safe field access with fallbacks
  const { fields } = props || {};
  const { Title, Excerpt, Thumbnail, BackgroundImage, Content, Button, Category, IsGatedLink } = fields || {};
  const [showGatedModal, setShowGatedModal] = useState(false);
  
  // Check if "no-background" style is selected
  const sxaStyles = `${props.params?.styles || ''}`;
  const hasNoBackground = sxaStyles.includes('no-background');

  const downloadFile = async (url: string) => {
    try {
      // Fetch the file as a blob to force download
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Extract filename from URL or use a default
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1] || 'download';
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to opening in new tab if download fails
      window.open(url, '_blank');
    }
  };

  const onGatedClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const gatedToken = localStorage.getItem('gatedResourceToken');

    if (!gatedToken && IsGatedLink?.value) {
      event.preventDefault();
      setShowGatedModal(true);
    } else {
      event.preventDefault();
      if (Button?.value?.href) {
        downloadFile(Button.value.href);
      }
    }
  };

  const onCloseModal = () => {
    const gatedToken = localStorage.getItem('gatedResourceToken');

    if (gatedToken && Button?.value?.href) {
      downloadFile(Button.value.href);
    }

    setShowGatedModal(false);
  };
  
  return (
    <>
      <Head>
        <meta property="og:description" content={Excerpt?.value || ''} />
        <meta property="og:name" content={Title?.value || ''} />
        <meta property="og:title" content={Title?.value || ''} />
        <meta property="og:image" content={Thumbnail?.value?.src || ''} />
        <meta property="og:type" content="article" />
      </Head>
      <div
        className={`component article-details page-background spaced-top col-12 ${props.params?.styles?.trimEnd() || ''}`}
        id={id ? id : undefined}
      >
        {BackgroundImage?.value?.src && (
          <ParallaxBackgroundImage BackgroundImage={BackgroundImage} />
        )}

        <div className="container">
          <Placeholder name="page-navigation" rendering={props.rendering} />
        </div>

        <div>
          <div className={`${hasNoBackground ? '' : 'background-content'} component-spaced container rounded-corners`}>
            <div className="p-3 p-sm-5">
              <div className="article-content">
                <div className="row row-gap-4 gx-5 align-items-start">
                  <div className="col-12 col-lg-6">
                    {(Thumbnail || isPageEditing) && (
                      <div className="article-thumbnail-wrapper">
                        <NextImage
                          field={Thumbnail}
                          className="article-img img-fluid"
                          width={600}
                          height={400}
                        />
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-lg-6">
                    <div className="article-header-content">
                      {(() => {
                        const categories = Category;
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
                      {(Title || isPageEditing) && (
                        <h1 className="article-title">
                          <Text field={Title} />
                        </h1>
                      )}
                      {(isPageEditing || Excerpt?.value) && (
                        <p className="article-excerpt">
                          <Text field={Excerpt} />
                        </p>
                      )}
                      {(isPageEditing || (Button?.value?.href && Button?.value?.text)) && Button && (
                        <div className="article-button-wrapper mt-4">
                          <Link field={Button} className="btn btn-cta-primary btn-sm" onClick={onGatedClick}>
                            {Button?.value?.text || 'Button'}
                          </Link>
                          <GatedResourceModal isOpen={showGatedModal} onClose={onCloseModal} />
                        </div>
                      )}
                      <div className="row mt-4">
                        <Placeholder name="article-meta" rendering={props.rendering} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <Placeholder name="article-page-content" rendering={props.rendering} />
                </div>
                {(Content || isPageEditing) && (
                  <div className="article-content-body mt-5">
                    <RichText field={Content} />
                  </div>
                )}
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
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  
  // Safe field access with fallbacks
  const { fields } = props || {};
  const { Title, Excerpt, Thumbnail, Content } = fields || {};
  
  return (
    <>
      <Head>
        <meta property="og:description" content={Excerpt?.value || ''} />
        <meta property="og:name" content={Title?.value || ''} />
        <meta property="og:title" content={Title?.value || ''} />
        <meta property="og:image" content={Thumbnail?.value?.src || ''} />
        <meta property="og:type" content="article" />
      </Head>
      <div
        className={`component simple-article-details mt-4 ${props.params?.styles?.trimEnd() || ''}`}
        id={id ? id : undefined}
      >
        {(Title || isPageEditing) && (
          <div className="container container-wide">
            <h1 className="article-title display-xxl">
              <Text field={Title} />
            </h1>
          </div>
        )}
        {(Thumbnail || isPageEditing) && (
          <div className="container container-widest-fluid">
            <NextImage
              field={Thumbnail}
              className="article-img img-fluid"
              width={1650}
              height={750}
            />
          </div>
        )}
        <div className="container">
          <div className="article-content">
            <div className="row">
              <div className="col-12 col-lg-6 mx-auto">
                {(Excerpt || isPageEditing) && (
                  <p className="article-excerpt body-md">
                    <Text field={Excerpt} />
                  </p>
                )}
                <div className="row">
                  <Placeholder name="article-page-content" rendering={props.rendering} />
                </div>
                {(Content || isPageEditing) && (
                  <div className="article-content-body rich-text mt-5">
                    <RichText field={Content} />
                  </div>
                )}
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
