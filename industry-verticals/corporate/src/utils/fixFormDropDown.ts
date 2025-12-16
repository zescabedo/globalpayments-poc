/* =========================
 * Utilities
 * ========================= */
function toArray<T>(v: T | T[] | null | undefined): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function cssEscape(value: string): string {
  if (
    typeof CSS !== 'undefined' &&
    typeof (CSS as { escape?: (v: string) => string }).escape === 'function'
  ) {
    return (CSS as { escape: (v: string) => string }).escape(value);
  }
  return String(value).replace(/([ !"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~])/g, '\\$1');
}

export function getFormRoot(formClass: string): HTMLElement | null {
  if (typeof document === 'undefined' || !formClass || formClass.trim() === '') {
    return null;
  }

  return document.querySelector(`.${formClass}`) as HTMLElement | null;
}

export function selectInFormByName(
  formRoot: HTMLElement | null,
  name: string
): HTMLSelectElement | null {
  if (!formRoot) return null;
  const selector = `select[name="${cssEscape(name)}"]`;
  return formRoot.querySelector<HTMLSelectElement>(selector);
}

/**
 * Convert UI value(s) -> sc-value(s) for submit.
 * If select is single, returns a string; if multiple, returns string[].
 */
export function mapUiToScForSubmit(
  selectEl: HTMLSelectElement | null,
  value: string | string[]
): string | string[] {
  if (!selectEl) return value;

  const mapOne = (v: string) => {
    const opt = Array.from(selectEl.options).find((o: HTMLOptionElement) => o.value === v) as
      | HTMLOptionElement
      | undefined;
    return opt?.getAttribute('sc-value') ?? v;
  };

  const mapped = toArray(value).map(mapOne);
  return selectEl.multiple ? mapped : mapped[0] ?? '';
}

/**
 * Fix duplicate option values:
 * - keeps original value in `sc-value`
 * - makes `value` unique by appending a sanitized label
 * - preserves current selection(s)
 */
export function applyDropdownUniquenessFix(formRoot: HTMLElement | null) {
  if (!formRoot) return;

  const dropdowns = formRoot.querySelectorAll('select');

  dropdowns.forEach((dropdown: HTMLSelectElement) => {
    if (dropdown.hasAttribute('data-dropdown-fixed')) return;

    const optionValues = Array.from(dropdown.options).map((opt: HTMLOptionElement) => opt.value);
    const uniqueValues = [...new Set(optionValues)];
    if (optionValues.length === uniqueValues.length) return;

    const originalOptions = Array.from(dropdown.options).map((opt: HTMLOptionElement) => ({
      text: opt.text,
      value: opt.value,
    }));

    const currentValue = dropdown.multiple
      ? Array.from(dropdown.selectedOptions).map((o: HTMLOptionElement) => o.value)
      : dropdown.value;

    while (dropdown.firstChild) dropdown.removeChild(dropdown.firstChild);

    originalOptions.forEach((option) => {
      const newOption = document.createElement('option');
      let uniqueValue = option.value;

      if (option.value && option.text) {
        const sanitizedText = option.text
          .replace(/[^a-zA-Z0-9]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '');
        uniqueValue =
          option.value === ''
            ? sanitizedText
              ? `_${sanitizedText}`
              : ''
            : `${option.value}_${sanitizedText}`;
      }

      newOption.value = uniqueValue;
      newOption.text = option.text;
      newOption.setAttribute('sc-value', option.value);
      dropdown.appendChild(newOption);
    });

    // restore selection(s) by sc-value
    const opts = Array.from(dropdown.options);
    const selectBySc = (orig: string) => {
      const idx = opts.findIndex((o: HTMLOptionElement) => o.getAttribute('sc-value') === orig);
      if (idx >= 0) (opts[idx] as HTMLOptionElement).selected = true;
    };

    if (dropdown.multiple) {
      toArray(currentValue as string[]).forEach(selectBySc);
    } else if (typeof currentValue === 'string' && currentValue.length) {
      selectBySc(currentValue as string);
    }

    // cache initial sc-value on element
    if (dropdown.multiple) {
      const scVals = Array.from(dropdown.selectedOptions).map(
        (o: HTMLOptionElement) => o.getAttribute('sc-value') || o.value
      );
      dropdown.setAttribute('data-original-value', JSON.stringify(scVals));
    } else {
      const selected = dropdown.options[dropdown.selectedIndex] as HTMLOptionElement | undefined;
      dropdown.setAttribute(
        'data-original-value',
        selected?.getAttribute('sc-value') ?? selected?.value ?? ''
      );
    }

    dropdown.setAttribute('data-dropdown-fixed', 'true');
  });
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}
