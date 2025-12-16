import { Placeholder } from '@sitecore-jss/sitecore-jss-nextjs';
import { Container, Row } from 'react-bootstrap';
import { PageTemplatesProps } from './PageTemplates.types';
import { getAosAttributes } from '@/components/ui/AOS/AOS';

const PageTemplates1Column = (props: PageTemplatesProps) => {
  const { DynamicPlaceholderId, backgroundColorVariant, className } = props?.params || {};

  const phKeyLeft = `colleft-${DynamicPlaceholderId}`;

  const backgroundColorVariants =
    (backgroundColorVariant && 'bg-' + JSON.parse(backgroundColorVariant)?.Value?.value) || '';
  const aosAttributes = getAosAttributes(props);

  return (
    <div
      className={`component page-templates ${props?.className} ${backgroundColorVariants} ${className}`}
      {...aosAttributes}
    >
      <Container>
        <Row>
          {props?.rendering && (
            <>
              <div className="left-section">
                <Placeholder name={phKeyLeft} rendering={props?.rendering} />
              </div>
            </>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default PageTemplates1Column;

const PageTemplates2Column = (props: PageTemplatesProps) => {
  const { DynamicPlaceholderId, backgroundColorVariant, className } = props?.params || {};

  const phKeyLeft = `colleft-${DynamicPlaceholderId}`;
  const phKeyRight = `colright-${DynamicPlaceholderId}`;

  const backgroundColorVariants =
    (backgroundColorVariant && 'bg-' + JSON.parse(backgroundColorVariant)?.Value?.value) || '';
  const aosAttributes = getAosAttributes(props);
  return (
    <div
      className={`component page-templates ${props?.className} ${backgroundColorVariants} ${className}`}
      {...aosAttributes}
    >
      <Container>
        <Row>
          {props?.rendering && (
            <>
              <div className="left-section">
                <Placeholder name={phKeyLeft} rendering={props?.rendering} />
              </div>
              <div className="right-section">
                <Placeholder name={phKeyRight} rendering={props?.rendering} />
              </div>
            </>
          )}
        </Row>
      </Container>
    </div>
  );
};
const PageTemplates3Column = (props: PageTemplatesProps) => {
  const { DynamicPlaceholderId, backgroundColorVariant, className } = props?.params || {};

  const phKeyLeft = `colleft-${DynamicPlaceholderId}`;
  const phKeyMiddle = `colmiddle-${DynamicPlaceholderId}`;
  const phKeyRight = `colright-${DynamicPlaceholderId}`;

  const backgroundColorVariants =
    (backgroundColorVariant && 'bg-' + JSON.parse(backgroundColorVariant)?.Value?.value) || '';
  const aosAttributes = getAosAttributes(props);

  return (
    <div
      className={`component page-templates ${props?.className} ${backgroundColorVariants} ${className}`}
      {...aosAttributes}
    >
      <Container>
        <Row>
          {props?.rendering && (
            <>
              <div className="left-section">
                <Placeholder name={phKeyLeft} rendering={props?.rendering} />
              </div>

              <div className="middle-section">
                <Placeholder name={phKeyMiddle} rendering={props?.rendering} />
              </div>

              <div className="right-section">
                <Placeholder name={phKeyRight} rendering={props?.rendering} />
              </div>
            </>
          )}
        </Row>
      </Container>
    </div>
  );
};

export const Split_40_40_40 = (props: PageTemplatesProps): JSX.Element => {
  return (
    <PageTemplates3Column
      rendering={props?.rendering}
      params={props?.params}
      placeholders={props?.placeholders}
      className="split-40x40x40"
    />
  );
};

export const Split_80_20 = (props: PageTemplatesProps): JSX.Element => {
  return (
    <PageTemplates1Column
      rendering={props?.rendering}
      params={props?.params}
      placeholders={props?.placeholders}
      className="split-80"
    />
  );
};

export const Middle_1x5x5x1 = (props: PageTemplatesProps): JSX.Element => {
  return (
    <PageTemplates2Column
      rendering={props?.rendering}
      params={props?.params}
      placeholders={props?.placeholders}
      className="middle-1x5x5x1"
    />
  );
};

export const Split_50_50 = (props: PageTemplatesProps): JSX.Element => {
  return (
    <PageTemplates2Column
      rendering={props?.rendering}
      params={props?.params}
      placeholders={props?.placeholders}
      className="split-50x50"
    />
  );
};

export const Middle_2x8x2 = (props: PageTemplatesProps): JSX.Element => {
  return (
    <PageTemplates1Column
      rendering={props?.rendering}
      params={props?.params}
      placeholders={props?.placeholders}
      className="middle-2x8x2"
    />
  );
};

export const Middle_1x10x1 = (props: PageTemplatesProps): JSX.Element => {
  return (
    <PageTemplates1Column
      rendering={props?.rendering}
      params={props?.params}
      placeholders={props?.placeholders}
      className="middle-1x10x1"
    />
  );
};

export const Split_70_30 = (props: PageTemplatesProps): JSX.Element => {
  return (
    <PageTemplates2Column
      rendering={props?.rendering}
      params={props?.params}
      placeholders={props?.placeholders}
      className="split-70x30"
    />
  );
};

export const Split_60_40 = (props: PageTemplatesProps): JSX.Element => {
  return (
    <PageTemplates2Column
      rendering={props?.rendering}
      params={props?.params}
      placeholders={props?.placeholders}
      className="split-60x40"
    />
  );
};

export const Middle_2x4x4x2 = (props: PageTemplatesProps): JSX.Element => {
  return (
    <PageTemplates2Column
      rendering={props?.rendering}
      params={props?.params}
      placeholders={props?.placeholders}
      className="middle-2x4x4x2"
    />
  );
};

export const Split_5x1x6 = (props: PageTemplatesProps): JSX.Element => {
  return (
    <PageTemplates2Column
      rendering={props?.rendering}
      params={props?.params}
      placeholders={props?.placeholders}
      className="split-5x1x6"
    />
  );
};

export const Split_30_70 = (props: PageTemplatesProps): JSX.Element => {
  return (
    <PageTemplates2Column
      rendering={props?.rendering}
      params={props?.params}
      placeholders={props?.placeholders}
      className="split-70x30 reverse-layout"
    />
  );
};
