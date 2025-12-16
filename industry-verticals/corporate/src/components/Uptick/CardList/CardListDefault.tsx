import { Container, Row } from 'react-bootstrap';
import { Link, RichText, useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';
import { CardListProps } from '@/components/Uptick/CardList/CardList.types';
import CardListDefaultItem from '@/components/Uptick/CardList/CardListDefaultItem';

const CardListDefault = (props: CardListProps): JSX.Element => {
  const { fields, params } = props || {};

  const titleField = fields.title;
  if (titleField && titleField.value) {
    const { sitecoreContext } = useSitecoreContext();
    const fields = sitecoreContext?.route?.fields;
    const authorName = fields ? fields['Given name'] : '';
    titleField.value = titleField.value.replace('{{authorName}}', authorName);
  }

  return (
    <div
      className={`component card-list ${
        params?.variant === 'article'
          ? 'article'
          : params?.variant === 'feature-on-top'
          ? 'feature-on-top-variant'
          : 'default'
      }`}
    >
      <Container>
        <Row>
          <div className="title-row">
            {fields.title?.value && <RichText className="title" tag="h2" field={titleField} />}
            {fields.ctaLink?.value?.href && (
              <Link field={fields.ctaLink} className="btn-cta-tertiary">
                {fields.ctaLink?.value.text || 'Explore more'}
              </Link>
            )}
          </div>
        </Row>
        <Row>
          <div className={`card-list-items`}>
            {fields.cards.map((card, i) => {
              return <CardListDefaultItem {...card} key={card?.title?.value || i} />;
            })}
          </div>
        </Row>
      </Container>
    </div>
  );
};

export default CardListDefault;
