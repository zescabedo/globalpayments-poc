import { Container, Row } from 'react-bootstrap';
import {
  AuthorCardProps,
  AuthorLite,
  SMEContentBlockFields,
} from '@/components/Uptick/AuthorCard.types';
import { AuthorCardRenderer } from '@/components/Uptick/AuthorCardRenderer';
import { SMEContentBlock } from '@/components/Uptick/SMEContentBlock';
import { useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';
import { buildUptickUrl } from '@/utils/uptick/buildUptickUrl';
import { useBffList } from '@/utils/uptick/useBffList';
import { AuthorCardFields } from '@/components/Uptick/AuthorCard.types';
import { ProductionApiResponse } from '@/utils/uptick/useUptickCardList';
import { mapAuthorToAuthorFields } from '@/lib/uptick/mappers';
import localDebug from '@/lib/_platform/logging/debug-log';

const AuthorCard = (props: AuthorCardProps): JSX.Element => {
  let { fields } = props || {};

  const { sitecoreContext } = useSitecoreContext();
  const site = sitecoreContext?.site?.name || 'corporate';
  const lang = sitecoreContext?.language || 'en';
  const pageSize = 1;
  const authorId = sitecoreContext?.route?.itemId || 'aceeec0f-a122-42c0-b87b-1d87f21122a9';

  const url = buildUptickUrl('author', { site, lang, pageSize }, { authorId });
  localDebug.uptick('[AuthorCard] url: %s', url);
  const { data } = useBffList<ProductionApiResponse<AuthorLite>>(url, props.fetcherOverride);

  let items: AuthorLite[];

  if (!data || !data.success || !Array.isArray(data.data?.content)) {
    localDebug.uptick.warn('[AuthorCard] Invalid API response format: %o', data);
    items = [];
  } else {
    items = data.data.content;
  }

  const authors: AuthorCardFields[] = items.map((a: AuthorLite) =>
    mapAuthorToAuthorFields(a, sitecoreContext)
  );

  fields = authors.at(0) || ({} as AuthorCardFields);
  if (fields.contentListingUrl) {
    fields.contentListingUrl.value = { text: '', href: '', target: '' };
  }

  const smeContentBlockFields: SMEContentBlockFields = {
    title: fields.longBiographyTitle || { value: '' },
    subtitle: fields.longBiographySubtitle || { value: '' },
    content: fields.longBiographyContent || { value: '' },
  };

  return (
    <div className={`component uptick-author-card`}>
      <Container>
        <Row>
          <AuthorCardRenderer {...fields } authorNameTag="h1" />
        </Row>
        {fields.isSME && (
          <Row>
            <SMEContentBlock {...smeContentBlockFields} />
          </Row>
        )}
      </Container>
    </div>
  );
};

export default AuthorCard;
