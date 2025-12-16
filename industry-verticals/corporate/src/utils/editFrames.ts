import { EditIconButtons } from './SiteCoreCustomEditBtn';

export const getIconEditFrameProps = (dataSource?: string) => ({
  dataSource: dataSource ? { itemId: dataSource } : undefined,
  buttons: EditIconButtons,
  title: 'Edit Icon',
  tooltip: 'Modify the Icon within this section',

  cssClass: 'jss-edit-frame',
  parameters: {},
});
