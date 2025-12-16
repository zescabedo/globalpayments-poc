import { useEffect } from 'react';

const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');

  // Limit to 10 digits
  const limitedDigits = digits.slice(0, 10);

  // Format based on length
  if (limitedDigits.length <= 3) {
    return limitedDigits;
  } else if (limitedDigits.length <= 6) {
    return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`;
  } else {
    return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
  }
};

export const usePhoneFormatting = (formClass: string | undefined) => {
  useEffect(() => {
    if (!formClass || typeof document === 'undefined') return;

    const formRoot = document.querySelector(`.${formClass}`);
    if (!formRoot) return;

    // Store original values to detect React state resets
    const phoneValueStore = new Map<string, string>();

    const applyFormatting = (input: HTMLInputElement, triggerChange = false) => {
      const currentValue = input.value;
      const storedValue = phoneValueStore.get(input.name);

      // If value was reset by React but we have a stored formatted value, restore it
      if (storedValue && currentValue !== storedValue && !currentValue.includes('-')) {
        const digitsInStored = storedValue.replace(/\D/g, '');
        const digitsInCurrent = currentValue.replace(/\D/g, '');

        // If the digits are the same, restore the formatted version
        if (digitsInStored === digitsInCurrent && digitsInCurrent.length > 0) {
          input.value = storedValue;
          return;
        }
      }

      // Format the current value
      const formattedValue = formatPhoneNumber(currentValue);

      if (formattedValue !== currentValue) {
        input.value = formattedValue;
        phoneValueStore.set(input.name, formattedValue);

        if (triggerChange) {
          // Use setTimeout to avoid React batching issues
          setTimeout(() => {
            const changeEvent = new Event('change', { bubbles: true });
            const inputEvent = new Event('input', { bubbles: true });
            input.dispatchEvent(inputEvent);
            input.dispatchEvent(changeEvent);
          }, 0);
        }
      }

      //  If input is empty, clear stored value
      if (input.value.trim() === '') {
        phoneValueStore.delete(input.name);
      }
    };

    const handlePhoneInput = (e: Event) => {
      const input = e.target as HTMLInputElement;
      const cursorPosition = input.selectionStart || 0;
      const oldLength = input.value.length;

      applyFormatting(input, true);

      // Adjust cursor position
      const newLength = input.value.length;
      const diff = newLength - oldLength;
      const newCursorPos = cursorPosition + diff;

      requestAnimationFrame(() => {
        input.setSelectionRange(newCursorPos, newCursorPos);
      });
    };

    const handlePhonePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      const pastedText = e.clipboardData?.getData('text') || '';
      const formattedValue = formatPhoneNumber(pastedText);

      input.value = formattedValue;
      phoneValueStore.set(input.name, formattedValue);

      // Trigger React state update
      const changeEvent = new Event('change', { bubbles: true });
      const inputEvent = new Event('input', { bubbles: true });
      input.dispatchEvent(inputEvent);
      input.dispatchEvent(changeEvent);
    };

    const handlePhoneBlur = (e: Event) => {
      const input = e.target as HTMLInputElement;
      applyFormatting(input, true);
    };

    // Function to monitor and reapply formatting
    const monitorPhoneFields = () => {
      const phoneInputs = formRoot.querySelectorAll('input[type="tel"].js-phone-formatting');

      phoneInputs.forEach((input) => {
        const phoneInput = input as HTMLInputElement;
        const currentValue = phoneInput.value;
        const storedValue = phoneValueStore.get(phoneInput.name);

        // If value exists but isn't formatted, format it
        if (currentValue && !currentValue.includes('-')) {
          const digitsOnly = currentValue.replace(/\D/g, '');
          if (digitsOnly.length > 0) {
            applyFormatting(phoneInput, false);
          }
        }
        // If current formatted value differs from stored, update store
        else if (currentValue && currentValue !== storedValue) {
          phoneValueStore.set(phoneInput.name, currentValue);
        }
      });
    };

    // Attach event listeners
    const attachListeners = () => {
      const phoneInputs = formRoot.querySelectorAll('input[type="tel"].js-phone-formatting');

      phoneInputs.forEach((input) => {
        input.addEventListener('input', handlePhoneInput);
        input.addEventListener('paste', handlePhonePaste);
        input.addEventListener('blur', handlePhoneBlur);

        // Apply initial formatting
        const phoneInput = input as HTMLInputElement;
        if (phoneInput.value && !phoneInput.value.includes('-')) {
          applyFormatting(phoneInput, true);
        }
      });
    };

    // Initial setup
    attachListeners();
    monitorPhoneFields();

    // Monitor for form changes (React re-renders)
    const observer = new MutationObserver(() => {
      monitorPhoneFields();
      attachListeners();
    });

    observer.observe(formRoot, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['value'],
    });

    // Also monitor on a regular interval as backup
    const intervalId = setInterval(monitorPhoneFields, 100);

    // Cleanup
    return () => {
      const phoneInputs = formRoot.querySelectorAll('input[type="tel"].js-phone-formatting');
      phoneInputs.forEach((input) => {
        input.removeEventListener('input', handlePhoneInput);
        input.removeEventListener('paste', handlePhonePaste);
        input.removeEventListener('blur', handlePhoneBlur);
      });
      observer.disconnect();
      clearInterval(intervalId);
      phoneValueStore.clear();
    };
  }, [formClass]);
};
