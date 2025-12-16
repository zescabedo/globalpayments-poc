import { PlanSelectorCardsProps } from '../PlanSelectorCard/PlanSelectorCard.types';
import PlanSelectorCard from '../PlanSelectorCard/PlanSelectorCardText';

export const ThreeInRow = (props: PlanSelectorCardsProps): JSX.Element => {
  return (
    <div>
      <PlanSelectorCard rendering={props?.rendering} params={props?.params} />
    </div>
  );
};

export const FourInRow = (props: PlanSelectorCardsProps): JSX.Element => {
  return (
    <div>
      <PlanSelectorCard rendering={props?.rendering} params={props?.params} />
    </div>
  );
};

export const FiveInRow = (props: PlanSelectorCardsProps): JSX.Element => {
  return (
    <div>
      <PlanSelectorCard rendering={props?.rendering} params={props?.params} />
    </div>
  );
};
