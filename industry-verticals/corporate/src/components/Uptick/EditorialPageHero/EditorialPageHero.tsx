import React from 'react';
import { RichText, useSitecoreContext, EditFrame } from '@sitecore-jss/sitecore-jss-nextjs';
import Heading from '@/components/ui/Heading/Heading';
import { SecondaryNavigationProps } from './EditorialPageHero.types';
import { moveUpItemButton, moveDownItemButton } from '@/utils/ReorderingSwitcher';
import { useShouldRender } from '@/utils/useShouldRender';
import Link from 'next/link';
import { generateAllContentUrl } from '@/utils/uptick/linkResolver';
import EditorialPageSearch from './EditorialPageSearch';

const EditorialPageHero = ({ fields = {} }: SecondaryNavigationProps): JSX.Element => {
  const { sitecoreContext } = useSitecoreContext();
  const isEditing = sitecoreContext?.pageEditing;

  // Access fields.data.item for the actual data
  const item = fields?.data?.item || {};
  const title = item?.title?.jsonValue;
  const description = item?.tagline?.jsonValue;
  const allContentCtaPath = generateAllContentUrl(sitecoreContext);
  const allContentCtaText = item?.allContentCtaLabel?.jsonValue?.value;

  // Check if All Content should be displayed
  const showAllContent = !!allContentCtaPath;
  const shouldRender = useShouldRender();
  const MAX_VISIBLE_NAV_ITEMS = 6;

  return (
    <>
      {/* Editorial Page Hero code starts here */}
      <div className="editorial-page-hero">
        <div className="container">
          {shouldRender(title?.value) && <Heading className="title" level={1} text={title} />}

          {shouldRender(description?.value) && (
            <RichText className="description" field={description} tag="p" />
          )}

          {/* Navigation code starts here */}
          <nav>
            <div className="nav-list">
              {/* All Content */}
              {showAllContent && (
                <>
                  <Link
                    key="all-content"
                    className="uptick-content-taxonomy-roundedrect all-content-nav-item"
                    href={allContentCtaPath}
                    locale={false}
                  >
                    {allContentCtaText}
                  </Link>
                </>
              )}

              {/* Dynamic Navigation Items */}
              {item.contentTypes?.targetItems?.slice(0, MAX_VISIBLE_NAV_ITEMS)?.map((navItem) => {
                const ctaField = navItem?.displayTitle?.jsonValue?.value || navItem?.title?.jsonValue?.value;
                const navLink = generateAllContentUrl(sitecoreContext, [
                  navItem?.slug?.jsonValue?.value,
                ]);
                if (!ctaField && !isEditing) {
                  return null;
                }

                return (
                  <>
                    {isEditing ? (
                      <EditFrame
                        title="Edit Navigation Item"
                        dataSource={{ itemId: navItem.id }}
                        buttons={[moveUpItemButton, moveDownItemButton]}
                      >
                        {/* Directly render the Link component for editing */}
                        <Link href={navLink} className="uptick-content-taxonomy-roundedrect" locale={false}>
                          {ctaField}
                        </Link>
                      </EditFrame>
                    ) : (
                      <Link className="uptick-content-taxonomy-roundedrect" href={navLink} locale={false}>
                        {ctaField}
                      </Link>
                    )}
                  </>
                );
              })}

              {/* Article search code starts here */}
              <div className="nav-search">
                <EditorialPageSearch searchPlaceholder={fields?.data?.item?.searchPlaceholder} />
              </div>
              {/* Article search code ends here */}
            </div>
          </nav>
          {/* Navigation code ends here */}
        </div>
      </div>
      {/* Editorial Page Hero code ends here */}
    </>
  );
};

export default EditorialPageHero;
