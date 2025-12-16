import TabsComponent from '../components/layout/TabsComponent/TabsComponent';
import { TabsProps } from '../components/layout/TabsComponent/TabsComponent.types';
import { getAosAttributes } from '@/components/ui/AOS/AOS';

export const Default = (props: TabsProps): JSX.Element => {
  const aosAttributes = getAosAttributes(props);

  return (
    <div {...aosAttributes}>
      <TabsComponent rendering={props.rendering} params={props.params} />
    </div>
  );
};
