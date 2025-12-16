import { Text, RichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { SMEContentBlockFields } from '@/components/Uptick/AuthorCard.types';

export const SMEContentBlock = (props: SMEContentBlockFields): JSX.Element => {
  return (
    <div className="sme-content-block">
      <div className="sme-details">
        {props.title?.value && <Text tag="h3" className="sme-title" field={props.title} />}
        {props.subtitle?.value && (
          <Text tag="div" className="sme-subtitle" field={props.subtitle} />
        )}

        {props.content?.value && (
          <RichText tag="div" className="sme-content" field={props.content} />
        )}
      </div>
    </div>
  );
};
