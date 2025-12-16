import { Container, Row } from 'react-bootstrap';
import { RichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { AuthorCardListProps } from '@/components/Uptick/AuthorCardList.types';
import { AuthorCardRenderer } from '@/components/Uptick/AuthorCardRenderer';

const AuthorCardList = (props: AuthorCardListProps): JSX.Element => {
  const { fields } = props || {};

  return (
    <div className={`component uptick-author-card-list`}>
      <Container>
        <Row>
          <div className="title-row">
            {fields.title?.value && <RichText className="title" tag="h1" field={fields.title} />}
            {fields.subtitle?.value && (
              <RichText className="subtitle" tag="p" field={fields.subtitle} />
            )}
          </div>
        </Row>
        <Row>
          <div className="authors-listing">
            {fields.authors.map((author, i) => {
              return <AuthorCardRenderer {...author} key={author?.givenName?.value || i} />;
            })}
          </div>
        </Row>
      </Container>
    </div>
  );
};

export default AuthorCardList;
