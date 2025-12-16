import PromoHiLoCardWrapper from './PromoHiLoCard';
import { PromoHiLoDataprop } from './PromoHiLoCard.type';

export const ThreeInARow = (props: PromoHiLoDataprop): JSX.Element => {
  return (
    <>
      <PromoHiLoCardWrapper cardData={props} cardType={'hi-lo-card-three'} />
    </>
  );
};
export const FourInARow = (props: PromoHiLoDataprop): JSX.Element => {
  return (
    <>
      <PromoHiLoCardWrapper cardData={props} cardType={'hi-lo-card-four'} />
    </>
  );
};
export const FourInARowWithAction = (props: PromoHiLoDataprop): JSX.Element => {
  return (
    <>
      <PromoHiLoCardWrapper cardData={props} showCta={true} cardType={'hi-lo-card-action'} />
    </>
  );
};
