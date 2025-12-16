import LinkItem from '@/components/ui/Link/Link';
import { LinkFieldValue } from '@sitecore-jss/sitecore-jss-dev-tools';
import { RichText as JssRichText } from '@sitecore-jss/sitecore-jss-react';
import { QuickLinkListProps } from './Header.types';

const QuickLinkList = ({ title, items }: QuickLinkListProps) => {
  if (!items || items.length === 0) {
    return <></>;
  }
  return (
    <div className="quick-link-list-container">
      {title?.value && <JssRichText className="search-prompt-title" field={title} />}
      <ul>
        {items.map((item, index) => {
          const linkText = item?.text?.jsonValue?.value;
          const linkValue = item?.url?.jsonValue?.value;

          if (linkValue?.href) {
            linkValue.text = linkText || linkValue.title || linkValue.text;

            return (
              <li key={index}>
                <LinkItem field={item?.url?.jsonValue} value={linkValue as LinkFieldValue} />
              </li>
            );
          }

          return null;
        })}
      </ul>
    </div>
  );
};

export default QuickLinkList;
