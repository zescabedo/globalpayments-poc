import { EditFrame, RichText as JssRichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { ContentStatProps, ContentStatsFields, ResultItem } from './ContentStats.types';
import { Container, Row } from 'react-bootstrap';
import CountUp from 'react-countup';
import Heading from '@/components/ui/Heading/Heading';
import { CONTENT_STATS_DEFAULT_HEADING_LEVEL } from '@/constants/headingConfig';
import {
  addItemToParentDatasourceButton,
  deleteItemButton,
  moveDownItemButton,
  moveUpItemButton,
} from '@/utils/ReorderingSwitcher';
import { getFontSizeClasses } from '@/utils/fontSizeUtils';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';
import { useEffect, useState } from 'react';
import { ContentStatsConstant } from '@/constants/appConstants';
import { stripHtml } from '@/utils/stripHtml';
import { getPaddingValue } from '@/utils/Paddingutils';

const extractNumberParts = (
  value: string
): { prefix: string; number: number | null; suffix: string } => {
  const match = value.match(/^(.*?)(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return { prefix: '', number: null, suffix: '' };

  return {
    prefix: match[1],
    number: parseFloat(match[2]),
    suffix: match[3],
  };
};

const getDecimalPlaces = (num: number): number => {
  const parts = num.toString().split('.');
  return parts[1]?.length || 0;
};

const ContentStatItem = ({
  result,
  titleClass,
  tagClass,
  countupEnabled,
  countTriggerOnce,
  countupDuration,
}: {
  result: ResultItem;
  titleClass: string;
  tagClass: string;
  countupEnabled: boolean;
  countTriggerOnce: boolean;
  countupDuration: number;
}) => {
  const [hasMounted, setHasMounted] = useState(false);
  const { sitecoreContext } = useSitecoreContext();
  const isEditing = sitecoreContext?.pageEditing;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const rawValue = result?.title?.jsonValue?.value || '';
  const plainTextValue = stripHtml(rawValue);
  const { prefix, number, suffix } = extractNumberParts(plainTextValue);

  const shouldUseCountUp = !isEditing && number !== null && countupEnabled && hasMounted;

  return (
    <div className="content-stat">
      {shouldUseCountUp ? (
        <span className={`title ${titleClass}`}>
          {prefix}
          <CountUp
            start={0}
            end={number}
            duration={countupDuration}
            decimals={getDecimalPlaces(number)}
            enableScrollSpy={true}
            scrollSpyOnce={countTriggerOnce}
          >
            {({ countUpRef }) => <span ref={countUpRef} />}
            {/* For Line no 85 Please refer https://stackoverflow.com/a/78057764  */}
          </CountUp>
          {suffix}
        </span>
      ) : (
        result?.title?.jsonValue && (
          <JssRichText
            className={`title ${titleClass}`}
            field={result.title.jsonValue}
            tag="span"
          />
        )
      )}

      {result?.tag?.jsonValue && (
        <JssRichText className={`stat ${tagClass}`} field={result.tag.jsonValue} tag="p" />
      )}
    </div>
  );
};

const ContentStats = (props: ContentStatProps): JSX.Element => {
  const propsField = props?.fields?.data?.item || {};
  const params = props?.params || {};
  const results = propsField?.contentItems?.results || [];
  const { paddingTop, paddingBottom } = getPaddingValue(props?.params);
  const paddingTopClass = paddingTop ? `padding-t-${paddingTop}` : ``;
  const paddingBottomClass = paddingBottom ? `padding-b-${paddingBottom}` : ``;

  const backgroundColorVariant =
    (params?.backgroundColorVariant && JSON.parse(params?.backgroundColorVariant)?.Value?.value) ||
    'white';

  const additionalStyles = (params?.Styles || '').trim();
  const aosAttributes = getAosAttributes(props);
  const { titleClass, tagClass } = getFontSizeClasses(params) || {};

  const isCountUpAnimationEnalbled = params?.CountupAnimationEnable === '1';
  const isCountUpTriggerOnce = params?.CountupTriggerOnce === '1';
  const countupDuration = Number(params?.CountupDuration) || 2;

  return (
    <>
      <div
        className={`component bg-${backgroundColorVariant} content-stats ${additionalStyles} ${paddingTopClass} ${paddingBottomClass}`}
        {...aosAttributes}
      >
        <div className="component-content">
          <Container>
            <div className={`row-title`}>
              {propsField?.title?.jsonValue?.value && (
                <Heading
                  level={CONTENT_STATS_DEFAULT_HEADING_LEVEL}
                  className={`list-title ${titleClass}`}
                  richText
                  field={propsField?.title?.jsonValue}
                />
              )}
            </div>
            <Row>
              <div className="content-stats-items">
                {results.map((result: ResultItem, index: number) => (
                  <EditFrame
                    key={index}
                    title="Edit Content Stats"
                    dataSource={{ itemId: result?.id + '' }}
                    buttons={[
                      moveUpItemButton,
                      moveDownItemButton,
                      deleteItemButton,
                      addItemToParentDatasourceButton,
                    ]}
                  >
                    <ContentStatItem
                      result={result}
                      titleClass={titleClass}
                      tagClass={tagClass}
                      countupEnabled={isCountUpAnimationEnalbled}
                      countTriggerOnce={isCountUpTriggerOnce}
                      countupDuration={countupDuration}
                    />
                  </EditFrame>
                ))}
              </div>
            </Row>
          </Container>
        </div>
      </div>
    </>
  );
};
export const ThreeInARow = (props: {
  fields: ContentStatsFields;
  params: { backgroundColorVariant?: string };
}): JSX.Element => <ContentStats fields={props?.fields} params={props?.params} />;

export const FourInARow = (props: {
  fields: ContentStatsFields;
  params: { backgroundColorVariant?: string };
}): JSX.Element => <ContentStats fields={props?.fields} params={props?.params} />;

export const FiveInARow = (props: {
  fields: ContentStatsFields;
  params: { backgroundColorVariant?: string };
}): JSX.Element => <ContentStats fields={props?.fields} params={props?.params} />;

export const SixInARow = (props: {
  fields: ContentStatsFields;
  params: { backgroundColorVariant?: string };
}): JSX.Element => <ContentStats fields={props?.fields} params={props?.params} />;

export default FourInARow;
