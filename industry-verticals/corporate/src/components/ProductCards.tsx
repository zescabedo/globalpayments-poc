import { ProductCardProps } from '../components/layout/ProductCard/ProductCard.types';
import ProductCard from './layout/ProductCard/ProductCard';
export const TwoCardsInARow = (props: ProductCardProps): JSX.Element => {
  return (
    <div>
      <ProductCard rendering={props?.rendering} params={props?.params} />
    </div>
  );
};
export const ThreeCardsInARow = (props: ProductCardProps): JSX.Element => {
  return (
    <div>
      <ProductCard rendering={props?.rendering} params={props?.params} />
    </div>
  );
};
export const FourCardsInARow = (props: ProductCardProps): JSX.Element => {
  return (
    <div>
      <ProductCard rendering={props?.rendering} params={props?.params} />
    </div>
  );
};
export const Default = (props: ProductCardProps): JSX.Element => {
  return (
    <div>
      <ProductCard rendering={props?.rendering} params={props?.params} />
    </div>
  );
};
