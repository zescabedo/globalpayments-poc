import PromoCards from './layout/PromoCard/PromoCard';
import { PromoCardProps } from '../components/layout/PromoCard/PromoCard.types';

export const TwoCardInRow = (props: PromoCardProps): JSX.Element => {
  return <PromoCards rendering={props.rendering} params={props.params} />;
};
export const ThreeCardInRow = (props: PromoCardProps): JSX.Element => {
  return <PromoCards rendering={props.rendering} params={props.params} />;
};

export const FourCardInRow = (props: PromoCardProps): JSX.Element => {
  return <PromoCards rendering={props.rendering} params={props.params} />;
};
