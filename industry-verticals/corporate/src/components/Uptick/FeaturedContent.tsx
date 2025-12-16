import { Container, Row } from 'react-bootstrap';
import { RichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { CardListProps } from '@/components/Uptick/CardList/CardList.types';
import CardListDefaultItem from '@/components/Uptick/CardList/CardListDefaultItem';

const FeaturedContent = (props: CardListProps): JSX.Element => {
  const { fields, params } = props || {};
  const variant = params?.variant || 'default';
  const variantClass =
    variant === '2-in-row'
      ? 'two-in-row'
      : variant === '3-in-row'
      ? 'three-in-row'
      : variant === '4-in-row'
      ? 'four-in-row'
      : 'default';

  return (
    <div className={`component featured-content ${variantClass}`}>
      <Container>
        <Row>
          <div className="title-row">
            {fields.title?.value && <RichText className="title" tag="h2" field={fields.title} />}
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

export default FeaturedContent;
