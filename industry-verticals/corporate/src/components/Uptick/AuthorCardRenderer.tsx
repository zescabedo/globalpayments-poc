import { RichText, Link, Image } from '@sitecore-jss/sitecore-jss-nextjs';
import { AuthorCardFields } from '@/components/Uptick/AuthorCard.types';
import { UptickTaxonomy } from '@/components/Uptick//UptickTaxonomy';

import { useI18n } from 'next-localization';

export const AuthorCardRenderer = (props: AuthorCardFields): JSX.Element => {
  const authorNameTag = props.authorNameTag || 'h2';
  const Heading = authorNameTag as keyof JSX.IntrinsicElements;

  const { t } = useI18n();

  return (
    <div className={`author-card`}>
      <div className="author-image">
        <Image field={props.image} />
      </div>

      <div className="author-details">
        {(props.givenName?.value || props.surname?.value) && (
          <Heading className="author-name">
            {props.givenName?.value} {props.surname?.value}
          </Heading>
        )}

        {props.biography?.value && (
          <RichText tag="div" className="author-biography" field={props.biography} />
        )}

        {props.contentListingUrl?.value && props.contentListingUrl.value.href != '' && (
          <Link field={props.contentListingUrl} className="btn-cta-tertiary btn-base">
            <a>{`See ${props.givenName.value}'s content`}</a>
          </Link>
        )}

        <div className="areas-of-expertise">
          <p>{t('Areas of expertise')}</p>
          <UptickTaxonomy taxonomyItems={props.areasOfExpertise} isForAuthorCard />
        </div>
      </div>
    </div>
  );
};
