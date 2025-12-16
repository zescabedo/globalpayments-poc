import { Container, Row } from 'react-bootstrap';
import { Text } from '@sitecore-jss/sitecore-jss-nextjs';

export type IframeCerosFields = {
  title?: { value: string };
  cerosAccount?: { value: string };
  cerosId?: { value: string };
};

export type IframeCerosProps = {
  fields: IframeCerosFields;
  params?: { variant?: 'default' };
};

const CEROS_BASE_DOMAIN = 'https://view.ceros.com';

const IframeCeros = (props: IframeCerosProps): JSX.Element => {
  const { fields } = props || {};
  const title = fields?.title?.value || 'Ceros Interactive Experience';
  const account = fields?.cerosAccount?.value;
  const cerosId = fields?.cerosId?.value;

  const cerosUrl = account && cerosId ? `${CEROS_BASE_DOMAIN}/${account}/${cerosId}` : '';

  return (
    <div className="component iframe-ceros default">
      <Container>
        <Row>
          <div className="title-row">
            {fields?.title?.value && <Text tag="h2" className="title" field={fields.title} />}
          </div>
        </Row>
        <Row>
          <div className="iframe-wrapper">
            {cerosUrl ? (
              <iframe
                src={cerosUrl}
                title={title}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            ) : (
              <div className="iframe-fallback">
                <p>Content unavailable. Please try again later.</p>
                {cerosUrl && (
                  <a href={cerosUrl} target="_blank" rel="noopener noreferrer">
                    Open in new tab
                  </a>
                )}
              </div>
            )}
          </div>
        </Row>
      </Container>
    </div>
  );
};

export default IframeCeros;
