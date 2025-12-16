import { Field } from '@sitecore-jss/sitecore-jss-nextjs';
import { useShouldRender } from '@/utils/useShouldRender';
import { BaseComponentFields } from './ArticleDetail.types';
export interface InteractiveBlockFields extends BaseComponentFields {
  'Interactive Id': Field<string>;
  'Interactivity Type': {
    name: string;
  };
}

export type InteractiveBlockProps = {
  fields: InteractiveBlockFields;
};
export const InteractiveBlock = (props: InteractiveBlockProps): JSX.Element | null => {
  const interactiveTypeName = props.fields['Interactivity Type']?.name;
  const interactiveId = props.fields['Interactive Id']?.value;
  const shouldRender = useShouldRender();
  const src =
    interactiveTypeName?.toLowerCase() === 'ceros'
      ? `https://view.ceros.com/global-payments/${interactiveId}`
      : '';
  return (
    <div className="interactive-block">
      {shouldRender(src) && <iframe src={src} allowFullScreen />}
    </div>
  );
};
