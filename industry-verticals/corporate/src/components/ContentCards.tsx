import { ContentCardsProps } from '../components/layout/ContentCards/ContentCards.types';
import ContentCards from './layout/ContentCards/ContentCardsText';

export const TwoCards = (props: ContentCardsProps): JSX.Element => {
  return (
    <div>
      <ContentCards rendering={props?.rendering} params={props?.params} />
    </div>
  );
};

export const ThreeCards = (props: ContentCardsProps): JSX.Element => {
  return (
    <div>
      <ContentCards rendering={props?.rendering} params={props?.params} />
    </div>
  );
};

export const FourCards = (props: ContentCardsProps): JSX.Element => {
  return (
    <div>
      <ContentCards rendering={props?.rendering} params={props?.params} />
    </div>
  );
};
