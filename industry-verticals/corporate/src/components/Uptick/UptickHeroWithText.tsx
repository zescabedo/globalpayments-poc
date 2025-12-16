import { Container, Row } from 'react-bootstrap';
import { RichText, Image, useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';
import { UptickHeroWithTextFields, UptickHeroWithTextProps } from './UptickHeroWithText.types';

const UptickHeroWithText = (props: UptickHeroWithTextProps): JSX.Element => {
  const { sitecoreContext } = useSitecoreContext();
  const scFields = sitecoreContext?.route?.fields;
  const fields: UptickHeroWithTextFields = (scFields as unknown as UptickHeroWithTextFields) ?? props.fields;

  const mappedFields: UptickHeroWithTextFields = {
    heroTitle: { value: fields.heroTitle || '' },
    heroBrow: { value: fields.heroBrow || '' },
    heroDescription: { value: fields.heroDescription || '' },
    heroImage: fields.heroImage,
  };

  return (
    <div className={`component uptick-hero-with-text`}>
      <Container>
        <Row>
          <div className="content">
            {mappedFields.heroTitle?.value && (
              <RichText className="title" tag="h1" field={mappedFields.heroTitle} />
            )}
            {mappedFields.heroBrow?.value && (
              <RichText className="brow" field={mappedFields.heroBrow} />
            )}
            {mappedFields.heroDescription?.value && (
              <RichText className="subtitle" tag="p" field={mappedFields.heroDescription} />
            )}
          </div>
          <div className="media">
            <Image field={mappedFields.heroImage} />
          </div>
        </Row>
      </Container>
    </div>
  );
};

export default UptickHeroWithText;
