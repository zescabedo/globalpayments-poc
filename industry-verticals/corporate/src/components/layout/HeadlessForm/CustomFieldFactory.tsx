import React from 'react';
import { createDefaultFieldFactory, ValueFieldProps } from '@sitecore-jss/sitecore-jss-react-forms';
import { RichText as JssRichText } from '@sitecore-jss/sitecore-jss-nextjs';
import { FieldViewModel, InputViewModel } from '@sitecore-jss/sitecore-jss-forms';
import { CustomFieldsForForms } from '@/constants/appConstants';

export interface ValueProviderViewModel extends FieldViewModel {
  valueProviderSettings: {
    valueProviderItemId: string;
    parameters: string;
  };
}
interface dataRegex {
  parameters: string;
}

export interface ValueProviderInputViewModel extends InputViewModel, ValueProviderViewModel {}

const CustomFieldFactory = createDefaultFieldFactory();

//For RawHtml Field And Dynamic Fields
const htmlFields = [CustomFieldsForForms?.rawHTMLFieldId, CustomFieldsForForms?.dynamicFieldId];

htmlFields.forEach((id) => {
  CustomFieldFactory.setComponent(id, ({ field }: ValueFieldProps<ValueProviderInputViewModel>) => {
    const _htmlValue = field?.model?.html;
    return (
      <div>
        <JssRichText field={{ value: _htmlValue as string }} className={'html-content'} />
      </div>
    );
  });
});

//For Hidden Fields $ HiddenPardot Fields
const ids = [CustomFieldsForForms?.hiddenFieldPardotId, CustomFieldsForForms?.hiddenFieldId];

ids.forEach((id) => {
  CustomFieldFactory.setComponent(id, ({ field }: ValueFieldProps<ValueProviderInputViewModel>) => {
    return (
      <>
        <input
          type="hidden"
          id={field?.valueField?.id}
          name={field?.valueField?.name}
          value={field?.valueField?.value}
          data-sc-tracking={field?.model?.isTrackingEnabled}
          data-sc-field-name={field?.model?.name}
          data-sc-field-key={
            field?.model?.conditionSettings &&
            typeof field.model.conditionSettings === 'object' &&
            'fieldKey' in field.model.conditionSettings
              ? field.model.conditionSettings.fieldKey
              : undefined
          }
        />
      </>
    );
  });
});

// Add UTM Hidden Fields
CustomFieldFactory.setComponent(CustomFieldsForForms.utmFieldId, () => {
  return (
    <>
      {/* UTM Source */}
      <input type="hidden" className="utm_source" name="gpn_utm_source" value={''} />
      {/* UTM Medium */}
      <input type="hidden" className="utm_medium" name="gpn_utm_medium" value={''} />
      {/* UTM Campaign */}
      <input type="hidden" className="utm_campaign" name="gpn_utm_campaign" value={''} />
      {/* UTM Content */}
      <input type="hidden" className="utm_content" name="gpn_utm_content" value={''} />
      {/* UTM Term */}
      <input type="hidden" className="utm_term" name="gpn_utm_term" value={''} />
      {/* UTM gclid */}
      <input type="hidden" className="gclid" name="gpn_gclid" value={''} />
      {/* UTM fbclid */}
      <input type="hidden" className="fbclid" name="gpn_fbclid" value={''} />
      {/* UTM liclid */}
      <input type="hidden" className="li_fat_id" name="gpn_li_fat_id" value={''} />
      {/* affiliateid */}
      <input type="hidden" className="affiliateid" name="gpn_affiliateid" value={''} />
    </>
  );
});

CustomFieldFactory.setComponent(
  CustomFieldsForForms.numberAdvanceId,
  ({ field }: ValueFieldProps<ValueProviderInputViewModel>) => {
    return (
      <>
        <label htmlFor={field?.valueField?.id} className={field?.model?.labelCssClass}>
          {field?.model?.title}
        </label>
        <input
          id={field?.valueField?.id}
          name={field?.valueField?.name}
          className={field?.model?.cssClass}
          type="number"
          min={field?.model?.min?.toString()}
          max={field?.model?.max?.toString()}
          data-sc-tracking={field?.model?.isTrackingEnabled}
          data-sc-field-name={field?.model?.name}
          data-sc-field-key={
            field?.model?.conditionSettings &&
            typeof field.model.conditionSettings === 'object' &&
            'fieldKey' in field.model.conditionSettings
              ? field.model.conditionSettings.fieldKey
              : undefined
          }
          data-val-range={field?.model?.validationDataModels[0]?.message}
          data-val-range-min={field?.model?.min?.toString()}
          data-val-range-max={field?.model?.max?.toString()}
          data-val-regex={field?.model?.validationDataModels[1]?.message}
          data-val-regex-pattern={
            JSON.parse(
              (field?.model?.validationDataModels[1] as unknown as dataRegex)?.parameters || '{}'
            ).regularExpression
          }
          data-val-number="The field Value must be a number."
          data-val={field?.model?.isTrackingEnabled}
          value={field?.valueField?.value}
        />
      </>
    );
  }
);

export default CustomFieldFactory;
