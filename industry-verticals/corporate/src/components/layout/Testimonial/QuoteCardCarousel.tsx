import { Row } from 'react-bootstrap';
import { QuoteCardDataProps } from './QuoteCardCarousel.types';
import { QuoteCardCarouselWrapper } from './QuoteCardCarouselWrapper';
import { getAosAttributes } from '@/components/ui/AOS/AOS';
import { useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';

const QuoteCardCarousel = (props: QuoteCardDataProps): JSX.Element => {
  const backgroundColorVariant =
    (props?.params?.backgroundColorVariant &&
      JSON.parse(props?.params?.backgroundColorVariant)?.Value.value) ||
    'white';
  const { sitecoreContext } = useSitecoreContext();
  const isEditing = sitecoreContext?.pageEditing;
  const cardDataList = props?.fields?.data?.item?.children?.results;
  if ((!Array.isArray(cardDataList) || cardDataList.length === 0) && !isEditing) {
    return <></>;
  }
  const aosAttributes = getAosAttributes(props);
  const quoteMarksColorVariant =
    (props?.params?.QuotemarksColorVariant &&
      JSON.parse(props?.params?.QuotemarksColorVariant)?.Value.value) ||
    '';
  return (
    <div className="container-fluid" style={{}} {...aosAttributes}>
      <Row key={'rowIndex'}>
        <QuoteCardCarouselWrapper
          params={props?.params}
          quoteMarkColor={quoteMarksColorVariant}
          cardVal={cardDataList}
          theme={`bg-${backgroundColorVariant}`}
        />
      </Row>
    </div>
  );
};
export default QuoteCardCarousel;
