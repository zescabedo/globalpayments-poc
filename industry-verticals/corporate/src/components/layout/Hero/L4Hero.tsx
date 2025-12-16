import { HeroProps } from './Hero.types';
import { RichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { Container } from 'react-bootstrap';
import Heading from '@/components/ui/Heading/Heading';
import { L4_HERO_DEFAULT_HEADING_LEVEL } from '@/constants/headingConfig';
import Ctas from '@/components/ui/CTA/CTA';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';

const L4Hero = (props: HeroProps): JSX.Element => {
  const { backgroundColorVariant, titleHeadingLevel } = props?.params || {};
  const { fields } = props || {};
  const { title = { jsonValue: { value: '' } }, tag = { jsonValue: { value: '' } } } =
    fields?.data?.item || {};

  const bgColorVariant =
    backgroundColorVariant && JSON?.parse(backgroundColorVariant)?.Value?.value;
  const bgColorClass = bgColorVariant ? `bg-${bgColorVariant}` : '';

  const parsedHeadingLevel =
    titleHeadingLevel && typeof titleHeadingLevel === 'string'
      ? JSON.parse(titleHeadingLevel)?.Value?.value
      : null;

  const { titleClass, tagClass } = getFontSizeClasses(props?.params) || {};

  return (
    <div className={`l4-hero-component ${bgColorClass}`}>
      <Container>
        {title?.jsonValue?.value && (
          <Heading
            level={parsedHeadingLevel || L4_HERO_DEFAULT_HEADING_LEVEL}
            field={title?.jsonValue}
            className={`title ${titleClass}`}
            richText
          />
        )}
        {tag?.jsonValue?.value && (
          <RichText field={tag?.jsonValue} tag="p" className={`tag ${tagClass}`} />
        )}

        <Ctas {...fields?.data?.item} />
      </Container>
    </div>
  );
};

export default L4Hero;
