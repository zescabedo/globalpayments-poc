import { Container, Row } from 'react-bootstrap';
import { RichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { CardListProps } from '@/components/Uptick/CardList/CardList.types';
import CardListDefaultItem from '@/components/Uptick/CardList/CardListDefaultItem';
import localDebug from '@/lib/_platform/logging/debug-log';

const RelatedContentCardsDefault = (props: CardListProps): JSX.Element => {
  const { fields } = props || {};

  localDebug.uptick('[RelatedContentCardsDefault] fields: %o', fields);

  return (
    // <div className={`component card-list ${params?.variant === 'article' ? 'article-variant' : 'default'}`}>
    <div className={`component related-content-cards `}>
      <Container>
        <Row>
          <div className="title-row">
            {fields.title?.value && <RichText className="title" tag="h5" field={fields.title} />}
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

export default RelatedContentCardsDefault;
