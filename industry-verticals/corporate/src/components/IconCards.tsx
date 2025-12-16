import { IconCardListProps } from './layout/IconCardList/IconCardList.types';
import IconCardList from './layout/IconCardList/IconCardList';

export const TwoInARow_sm_icon = (props: IconCardListProps): JSX.Element => {
  return (
    <IconCardList
      rendering={props?.rendering}
      params={props?.params}
      cssClass="two-in-row sm-icon"
    />
  );
};

export const TwoInARow_xl_icon = (props: IconCardListProps): JSX.Element => {
  return (
    <IconCardList
      rendering={props?.rendering}
      params={props?.params}
      cssClass="two-in-row xl-icon"
    />
  );
};

export const TwoInARow_Horizontal = (props: IconCardListProps): JSX.Element => {
  return (
    <IconCardList
      rendering={props?.rendering}
      params={props?.params}
      cssClass="two-in-row horizontal-icon"
    />
  );
};

export const ThreeInARow_sm_icon = (props: IconCardListProps): JSX.Element => {
  return (
    <IconCardList
      rendering={props?.rendering}
      params={props?.params}
      cssClass="three-in-row sm-icon"
    />
  );
};

export const ThreeInARow_xl_icon = (props: IconCardListProps): JSX.Element => {
  return (
    <IconCardList
      rendering={props?.rendering}
      params={props?.params}
      cssClass="three-in-row xl-icon"
    />
  );
};

export const FourInARow_xl_icon = (props: IconCardListProps): JSX.Element => {
  return (
    <IconCardList
      rendering={props?.rendering}
      params={props?.params}
      cssClass="four-in-row xl-icon"
    />
  );
};

export const FourInARow_sm_icon = (props: IconCardListProps): JSX.Element => {
  return (
    <IconCardList
      rendering={props?.rendering}
      params={props?.params}
      cssClass="four-in-row sm-icon"
    />
  );
};

export const Default = (props: IconCardListProps): JSX.Element => {
  return (
    <IconCardList
      rendering={props?.rendering}
      params={props?.params}
      cssClass="four-in-row sm-icon"
    />
  );
};
