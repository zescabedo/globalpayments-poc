import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Form } from '@sitecore-jss/sitecore-jss-react-forms';
import { NextRouter, withRouter } from 'next/router';
import { sitecoreApiKey } from 'temp/config';
import CustomFieldFactory from './CustomFieldFactory';
import { useI18n } from 'next-localization';
import AddVwoFormTracking from 'utils/AddVwoFormTracking';
import type { Form as SitecoreFormComponent } from '@sitecore-jss/sitecore-jss-react-forms';
import type { SitecoreForm as BaseSitecoreForm } from '@sitecore-jss/sitecore-jss-forms';
import type { FormField as SitecoreFormField, ViewModel } from '@sitecore-jss/sitecore-jss-forms';
import { FieldState } from '@sitecore-jss/sitecore-jss-react-forms/types/components/form';
import { initialFormDataLayer, submitFormDataLayer } from '@/utils/analyticsTracking';
import { evaluateCondition } from '@/utils/evaluateConditions';
import { ACTIONS, MATCHING_TYPE } from '@/constants/conditionalConstants';
import { useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';
import {
  applyDropdownUniquenessFix,
  getFormRoot,
  isStringArray,
  mapUiToScForSubmit,
  selectInFormByName,
} from '@/utils/fixFormDropDown';
import { usePhoneFormatting } from '@/utils/fixPhoneFormatting';
import { DictionaryConstants } from '@/constants/appConstants';
import { getPostFormErrorData } from '@/utils/getPostFormErrorData';
import { postUiErrorToCosmos } from '@/utils/errorReporting';

interface Condition {
  fieldId: string;
  operatorId: string;
  value: string;
}

interface Action {
  fieldId: string;
  actionTypeId: string;
  value?: string | number | boolean | undefined | object;
}

interface FieldCondition {
  matchTypeId: string;
  conditions: Condition[];
  actions: Action[];
}

interface ConditionSettings {
  fieldConditions: FieldCondition[];
  fieldKey?: string;
}

interface CustomFieldModel extends ViewModel {
  conditionSettings?: ConditionSettings;
  fieldKey?: string;
  cssClass?: string;
}

type CustomFormField = SitecoreFormField<CustomFieldModel>;

interface ExtendedSitecoreForm extends BaseSitecoreForm {
}

interface VwoTrackingProps {
  class: string;
  'data-gpn-form-id': string;
  'data-gpn-form-name': string;
}

type FormWithVwoTracking = ExtendedSitecoreForm & VwoTrackingProps;

interface FormCompProps {
  fields: ExtendedSitecoreForm;
  router: NextRouter;
}

type FormField = {
  fieldName: string;
  state: FieldState;
};

interface CustomSitecoreFormComponent extends SitecoreFormComponent {
  __isPatched?: boolean;
  __originalOnSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const markConditionalFields = (layout: ExtendedSitecoreForm): ExtendedSitecoreForm => {
  if (!layout?.fields) return layout;
  const clone = structuredClone(layout);
  const markFields = (fields: CustomFormField[]): CustomFormField[] => {
    if (!Array.isArray(fields)) return [];
    return fields.map((field) => {
      const newField = { ...field };
      const model = newField.model;
      if (model) {
        const conditionSettings = model.conditionSettings;
        const fieldKey = conditionSettings?.fieldKey;
        const cssClass = model.cssClass || '';
        const safeFieldKey = fieldKey ? `key-${fieldKey}` : '';

        if (fieldKey && !cssClass.includes(safeFieldKey)) {
          model.cssClass = `${cssClass} ${safeFieldKey}`.trim();
        }

        const fieldConditions = conditionSettings?.fieldConditions;

        if (Array.isArray(fieldConditions)) {
          const shouldBeHiddenInitially = fieldConditions.some((rule) =>
            rule.actions?.some(
              (action) => action?.fieldId === fieldKey && action?.actionTypeId === ACTIONS.SHOW
            )
          );

          if (shouldBeHiddenInitially && !model.cssClass?.includes('hidden-by-condition')) {
            model.cssClass = `${model.cssClass || ''} hidden-by-condition`.trim();
          }
        }
      }

      if (Array.isArray(newField.fields)) {
        newField.fields = markFields(newField.fields as CustomFormField[]);
      }

      return newField;
    });
  };

  clone.fields = markFields((clone.fields as CustomFormField[]) || []);

  return clone;
};

const clearAllHiddenFields = (vwoFormModel: FormWithVwoTracking, skipChangeEvents = false) => {
  const root = getFormRoot(vwoFormModel.class);
  if (!root) return;

  const hiddenFields = root.querySelectorAll(
    'fieldset.hidden-by-condition input, fieldset.hidden-by-condition textarea, fieldset.hidden-by-condition select'
  );

  hiddenFields.forEach((field) => {
    const element = field as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const tagName = element.tagName.toLowerCase();
    const inputType = (element as HTMLInputElement).type?.toLowerCase();

    if (tagName === 'input') {
      if (inputType === 'checkbox' || inputType === 'radio') {
        (element as HTMLInputElement).checked = false;
      } else {
        (element as HTMLInputElement).value = '';
      }
    } else if (tagName === 'textarea') {
      (element as HTMLTextAreaElement).value = '';
    } else if (tagName === 'select') {
      (element as HTMLSelectElement).selectedIndex = 0;
    }

    if (!skipChangeEvents) {
      setTimeout(() => {
        const changeEvent = new Event('change', { bubbles: true });
        element.dispatchEvent(changeEvent);
      }, 50);
    }
  });
};

const clearNewlyVisibleFields = (vwoFormModel: FormWithVwoTracking, formInstance?: Form | null) => {
  const root = getFormRoot(vwoFormModel.class);
  if (!root) return;

  // Find fields that just became visible (don't have hidden-by-condition class)
  const visibleFields = root.querySelectorAll(
    'fieldset:not(.hidden-by-condition) input, fieldset:not(.hidden-by-condition) textarea, fieldset:not(.hidden-by-condition) select'
  );

  const fieldsToUpdate: { name: string; value: string | boolean }[] = [];

  visibleFields.forEach((field) => {
    const element = field as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const tagName = element.tagName.toLowerCase();
    const inputType = (element as HTMLInputElement).type?.toLowerCase();
    const fieldName = element.getAttribute('name');

    if (!fieldName) return;

    // Check if field has default values that look like submission overrides
    let shouldClear = false;

    if (tagName === 'input') {
      const value = (element as HTMLInputElement).value;
      if (inputType === 'text' && value === 'null') shouldClear = true;
      if (inputType === 'email' && value === 'null') shouldClear = true;
      if (inputType === 'tel' && value === '000000000000') shouldClear = true;
      if (inputType === 'number' && value === '0') shouldClear = true;
    } else if (tagName === 'textarea') {
      const value = (element as HTMLTextAreaElement).value;
      if (value === 'null') shouldClear = true;
    } else if (tagName === 'select') {
      const value = (element as HTMLSelectElement).value;
      if (value === 'None') shouldClear = true;
    }

    if (shouldClear) {
      // Clear DOM value
      if (tagName === 'input') {
        if (inputType === 'checkbox' || inputType === 'radio') {
          (element as HTMLInputElement).checked = false;
          fieldsToUpdate.push({ name: fieldName, value: false });
        } else {
          (element as HTMLInputElement).value = '';
          fieldsToUpdate.push({ name: fieldName, value: '' });
        }
      } else if (tagName === 'textarea') {
        (element as HTMLTextAreaElement).value = '';
        fieldsToUpdate.push({ name: fieldName, value: '' });
      } else if (tagName === 'select') {
        (element as HTMLSelectElement).selectedIndex = 0;
        const newValue = (element as HTMLSelectElement).value;
        fieldsToUpdate.push({ name: fieldName, value: newValue });
      }
    }
  });

  // Update React form state if form instance is available
  if (formInstance && fieldsToUpdate.length > 0) {
    setTimeout(() => {
      fieldsToUpdate.forEach(({ name }) => {
        const element = root.querySelector(`[name="${name}"]`) as HTMLElement;
        if (element) {
          const changeEvent = new Event('change', { bubbles: true });
          element.dispatchEvent(changeEvent);
        }
      });
    }, 10);
  }
};

const applyConditionalLogic = (
  layout: ExtendedSitecoreForm,
  vwoFormModel?: FormWithVwoTracking,
  formInstance?: Form | null
) => {
  const traverseFields = (fields: CustomFormField[]) => {
    if (!Array.isArray(fields)) return;

    fields.forEach((field) => {
      const condSettings = field?.model?.conditionSettings;

      if (condSettings?.fieldConditions) {
        condSettings.fieldConditions.forEach((fc) => {
          const matchType = fc.matchTypeId;
          const conditionResults = (fc.conditions || []).map((cond) => {
            const el = document.querySelector(`.key-${cond.fieldId}`) as
              | HTMLInputElement
              | HTMLSelectElement;

            if (!el) return false;
            const val = el?.value ?? '';
            return evaluateCondition(val, cond.operatorId, cond.value);
          });

          const isMet =
            matchType === MATCHING_TYPE.ALL
              ? conditionResults.every(Boolean)
              : conditionResults.some(Boolean);

          fc.actions.forEach((action) => {
            const actionEl = document.querySelector(`.key-${action.fieldId}`)?.closest('fieldset');

            if (!actionEl) return;

            if (isMet) {
              if (action.actionTypeId === ACTIONS.SHOW)
                actionEl.classList.remove('hidden-by-condition');
              else if (action.actionTypeId === ACTIONS.HIDE)
                actionEl.classList.add('hidden-by-condition');
            } else {
              if (action.actionTypeId === ACTIONS.SHOW)
                actionEl.classList.add('hidden-by-condition');
              else if (action.actionTypeId === ACTIONS.HIDE)
                actionEl.classList.remove('hidden-by-condition');
            }
          });
        });
      }

      if (Array.isArray(field.fields)) traverseFields(field.fields);
    });
  };

  traverseFields(layout.fields as CustomFormField[]);

  if (vwoFormModel) {
    setTimeout(() => {
      clearAllHiddenFields(vwoFormModel, true);
      clearNewlyVisibleFields(vwoFormModel, formInstance);
    }, 50);
  }
};

const collectAllConditionFieldIds = (
  layout: ExtendedSitecoreForm,
  logicHandler: () => void
): (() => void) => {
  const uniqueFieldIds = new Set<string>();

  const handlers: { el: Element; handler: () => void }[] = [];

  function traverseFields(fields: CustomFormField[]) {
    if (!Array.isArray(fields)) return;

    for (const field of fields) {
      const fieldConditions = field?.model?.conditionSettings?.fieldConditions;

      if (Array.isArray(fieldConditions)) {
        for (const rule of fieldConditions) {
          if (Array.isArray(rule?.conditions)) {
            for (const condition of rule.conditions) {
              if (condition?.fieldId) uniqueFieldIds.add(condition.fieldId);
            }
          }
        }
      }

      if (Array.isArray(field?.fields)) traverseFields(field.fields);
    }
  }

  traverseFields(layout.fields as CustomFormField[]);

  uniqueFieldIds.forEach((fieldKey) => {
    const triggerEl = document.querySelector(`.key-${fieldKey}`);

    if (triggerEl) {
      triggerEl.addEventListener('change', logicHandler);
      handlers.push({ el: triggerEl, handler: logicHandler });
    }
  });

  return () => {
    handlers.forEach(({ el, handler }) => el.removeEventListener('change', handler));
  };
};

const patchFormInstance = (
  formInstance: SitecoreFormComponent,
  vwoFormModel: FormWithVwoTracking,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  t: (key: string) => string,
  contextItemId?: string
) => {
  if (
    !formInstance ||
    typeof formInstance.collectCurrentFieldValues !== 'function' ||
    typeof formInstance.onSubmit !== 'function' ||
    typeof formInstance.setState !== 'function'
  ) {
    return;
  }

  // Prevent multiple patches
  if ((formInstance as CustomSitecoreFormComponent).__isPatched) {
    return;
  }

  (formInstance as CustomSitecoreFormComponent).__isPatched = true;

  const originalSetState = formInstance.setState.bind(formInstance);
  formInstance.setState = (
    newState: Parameters<typeof originalSetState>[0],
    callback?: Parameters<typeof originalSetState>[1]
  ) => {
    if (newState && typeof newState === 'object' && 'nextForm' in newState) {
      (newState as { nextForm: ExtendedSitecoreForm }).nextForm = markConditionalFields(
        (newState as { nextForm: ExtendedSitecoreForm }).nextForm
      );
    }
    return originalSetState(newState, callback);
  };

  // Only transforms hidden fields to .Required = false
  const originalCollect = formInstance.collectCurrentFieldValues.bind(formInstance);
  formInstance.collectCurrentFieldValues = function () {
    const currentFields = originalCollect();
    const root = getFormRoot(vwoFormModel.class);

    const byName: Record<string, FormField> = {};
    currentFields.forEach((f: FormField) => (byName[f.fieldName] = f));

    // Handle select field mappings
    const mappedFromState = currentFields.map((field: FormField) => {
      const val = field?.state?.value;
      if (typeof val !== 'string' && !isStringArray(val)) return field;
      const selectEl = selectInFormByName(root, field.fieldName);
      if (!selectEl) return field;
      const scVal = mapUiToScForSubmit(selectEl, val);
      return { ...field, state: { ...field.state, value: scVal } };
    });

    // Handle DOM selects
    const domSelects = root ? Array.from(root.querySelectorAll('select')) : [];
    domSelects.forEach((sel) => {
      const name = sel.name;
      if (!name) return;
      const uiVal = sel.multiple ? Array.from(sel.selectedOptions).map((o) => o.value) : sel.value;
      const scVal = mapUiToScForSubmit(sel, uiVal as string | string[]);
      if (byName[name]) {
        const idx = mappedFromState.findIndex((f) => f.fieldName === name);
        if (idx >= 0) mappedFromState[idx].state.value = scVal;
      } else {
        mappedFromState.push({
          fieldName: name,
          state: { value: scVal, isValid: true, errors: [] },
        });
      }
    });

    // CRITICAL: Capture ALL DOM fields (including text, tel, etc.)
    const allFormFields = root ? Array.from(root.querySelectorAll('input, textarea, select')) : [];

    allFormFields.forEach((fieldEl) => {
      const element = fieldEl as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const fieldName = element.getAttribute('name');
      if (!fieldName) return;

      // Check if we already have this field in our collection
      const existingFieldIndex = mappedFromState.findIndex((f) => f.fieldName === fieldName);

      // Get current DOM value
      let currentValue = '';
      const tagName = element.tagName.toLowerCase();
      const inputType = (element as HTMLInputElement).type?.toLowerCase();

      if (tagName === 'input') {
        if (inputType === 'checkbox' || inputType === 'radio') {
          currentValue = (element as HTMLInputElement).checked ? 'true' : 'false';
        } else {
          currentValue = (element as HTMLInputElement).value || '';
        }
      } else if (tagName === 'textarea') {
        currentValue = (element as HTMLTextAreaElement).value || '';
      } else if (tagName === 'select') {
        const selectEl = element as HTMLSelectElement;
        currentValue = selectEl.value || '';
        // Handle selects with mapUiToScForSubmit if needed
        const scVal = mapUiToScForSubmit(selectEl, currentValue);
        currentValue = Array.isArray(scVal) ? scVal.join(',') : scVal;
      }

      if (existingFieldIndex >= 0) {
        // Update existing field with current DOM value
        mappedFromState[existingFieldIndex].state.value = currentValue;
      } else {
        // Add missing field
        mappedFromState.push({
          fieldName,
          state: { value: currentValue, isValid: true, errors: [] },
        });
      }
    });

    // Helper function to check if field is hidden
    const isFieldHidden = (fieldName: string): boolean => {
      const fieldEl = root?.querySelector(`[name="${fieldName}"]`) as HTMLElement | null;
      if (!fieldEl) return false;
      const hiddenWrapper = fieldEl.closest('.hidden-by-condition');
      return hiddenWrapper !== null;
    };

    // Transform hidden fields to use .Required instead of .Value
    const finalFields: FormField[] = [];

    mappedFromState.forEach((field) => {
      if (isFieldHidden(field.fieldName)) {
        // For hidden fields, create a .Required field instead of .Value field
        const requiredFieldName = field.fieldName.replace('.Value', '.Required');
        finalFields.push({
          fieldName: requiredFieldName,
          state: {
            value: 'false', // Set Required to false for hidden fields
            isValid: true,
            errors: [],
          },
        });
      } else {
        // For visible fields, keep original .Value field
        finalFields.push(field);
      }
    });

    return finalFields;
  };

  const FormPrototype = Object.getPrototypeOf(formInstance);
  const originalOnSubmit = FormPrototype.onSubmit.bind(formInstance);

  if (!(formInstance as CustomSitecoreFormComponent).__originalOnSubmit) {
    (formInstance as CustomSitecoreFormComponent).__originalOnSubmit = originalOnSubmit;
  }

  const getFormStatusErrorKey = (status: number): string => {
    if (status === 500) {
      return DictionaryConstants.forms.formError500;
    } else if (status === 400) {
      return DictionaryConstants.forms.formError400;
    } else {
      return DictionaryConstants.forms.formErrorGeneric;
    }
  };

  // Enhanced onSubmit with proper hidden field handling
  formInstance.onSubmit = async function (e: React.FormEvent<HTMLFormElement>) {
    if (e.type !== 'submit') return;
    e.preventDefault();

    const formEl = e.currentTarget as HTMLFormElement;
    const formIsValid = formEl.checkValidity ? formEl.checkValidity() : true;

    if (!formIsValid) {
      const errorPayload = getPostFormErrorData(400, 'Form is not valid');
      await postUiErrorToCosmos(errorPayload);
      return;
    }

    try {
      // Intercept fetch to handle responses
      const originalFetch = window.fetch;

      try {
        window.fetch = async (...args) => {
          let modifiedArgs: Parameters<typeof fetch> = args;
          const req = args[0];
          let url = '';

          if (typeof req === 'string') {
            url = req;
            if (url.includes('/api/jss/formbuilder') && contextItemId) {
              const urlObj = new URL(url, window.location.origin);
              urlObj.searchParams.set('sc_itemid', contextItemId);
              modifiedArgs = [urlObj.toString(), args[1]];
            }
          } else if (req instanceof Request) {
            url = req.url;
            if (url.includes('/api/jss/formbuilder') && contextItemId) {
              const urlObj = new URL(url);
              urlObj.searchParams.set('sc_itemid', contextItemId);
              const newRequest = new Request(urlObj.toString(), req);
              modifiedArgs = [newRequest, args[1]];
            }
          }

          const response = await originalFetch(...modifiedArgs);

          if (url?.includes('/api/jss/formbuilder')) {
            if (!response.ok) {
              const errorKey = getFormStatusErrorKey(response.status);
              const errorMessage = t
                ? t(errorKey)
                : `${response.statusText} (status ${response.status})`;
              setError(errorMessage);
              const isServerError = response.status === 500;

              const json = await response.clone().json();
              let responseText = 'Form validation failed';

              if (json?.validationErrors) {
                const fieldMessages = Object.entries(json.validationErrors)
                  .map(([field, messages]) => {
                    if (Array.isArray(messages)) {
                      return `${field.split('.').pop()}: ${messages.join(', ')}`;
                    }
                    return `${field.split('.').pop()}: unknown error`;
                  })
                  .join(' | ');

                responseText += `: ${fieldMessages}`;
              }

              const errorPayload = getPostFormErrorData(
                response.status,
                isServerError ? t('Exception Detected') : responseText
              );
              await postUiErrorToCosmos(errorPayload);
              setTimeout(() => {
                clearAllHiddenFields(vwoFormModel, false);
              }, 200);
            } else {
              setError(null);
              submitFormDataLayer(vwoFormModel);
            }
          }
          return response;
        };

        // Call original JSS form submission (will use our enhanced collectCurrentFieldValues)
        await (formInstance as CustomSitecoreFormComponent).__originalOnSubmit(e);
      } finally {
        // Always restore fetch
        window.fetch = originalFetch;
      }
    } catch (error) {
      const errorPayload = getPostFormErrorData(0, (error as Error)?.message || 'Unknown error');
      await postUiErrorToCosmos(errorPayload);
      setError(`${t('Submission failed')}`);
    }
  };
};

const HeadlessForm = (props: FormCompProps) => {
  const formRef = useRef<SitecoreFormComponent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { sitecoreContext } = useSitecoreContext();
  const contextItemId = sitecoreContext?.itemId || '';
  const { t } = useI18n();

  const propsFieldDataWithCondition = useMemo(
    () => (props.fields ? markConditionalFields(props.fields) : null),
    [props.fields]
  );

  const vwoFormModel = useMemo(
    () => (props.fields ? (AddVwoFormTracking(props.fields) as FormWithVwoTracking) : null),
    [props.fields]
  );

  useEffect(() => {
    if (!vwoFormModel) return;
    initialFormDataLayer(vwoFormModel);
  }, [vwoFormModel]);

  useEffect(() => {
    if (!propsFieldDataWithCondition || !vwoFormModel) return;
    const logicHandler = () =>
      applyConditionalLogic(propsFieldDataWithCondition, vwoFormModel, formRef.current);
    logicHandler();
    const cleanup = collectAllConditionFieldIds(propsFieldDataWithCondition, logicHandler);
    return cleanup;
  }, [propsFieldDataWithCondition, vwoFormModel]);

  useEffect(() => {
    if (!propsFieldDataWithCondition || !vwoFormModel) return;
    const formInstance = formRef.current;
    if (!formInstance) return;
    let attempts = 0;
    const max = 50;
    const attemptPatch = () => {
      attempts++;

      if (typeof formInstance.setState === 'function') {
        patchFormInstance(formInstance, vwoFormModel, setError, t, contextItemId);
      } else if (attempts < max) {
        setTimeout(attemptPatch, 100);
      }
    };

    attemptPatch();
  }, [propsFieldDataWithCondition, vwoFormModel]);

  usePhoneFormatting(vwoFormModel?.class);

  useEffect(() => {
    if (!vwoFormModel || typeof document === 'undefined') return;
    const formElement = document.querySelector(`.${vwoFormModel.class}`);

    if (formElement) {
      formElement.setAttribute('data-gpn-form-id', vwoFormModel['data-gpn-form-id']);
      formElement.setAttribute('data-gpn-form-name', vwoFormModel['data-gpn-form-name']);
    }
  }, [vwoFormModel]);

  useEffect(() => {
    if (!vwoFormModel) return;

    const run = () => applyDropdownUniquenessFix(getFormRoot(vwoFormModel.class));
    run();
    const el = getFormRoot(vwoFormModel.class);

    if (!el) return;

    const observer = new MutationObserver(run);
    observer.observe(el, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [vwoFormModel?.class]);

  if (!propsFieldDataWithCondition || !vwoFormModel) {
    return null;
  }

  return (
    <>
      <Form
        language={props.router.locale}
        form={propsFieldDataWithCondition}
        sitecoreApiHost={''}
        sitecoreApiKey={sitecoreApiKey}
        onRedirect={(url) => props.router.push(url)}
        className={`sitecore-forms ${vwoFormModel?.class}`}
        fieldFactory={CustomFieldFactory}
        ref={formRef}
      />
      {error && (
        <div className="form-error" role="alert" aria-live="polite">
          <span>{error}</span>
        </div>
      )}
    </>
  );
};

export default withRouter(HeadlessForm);
