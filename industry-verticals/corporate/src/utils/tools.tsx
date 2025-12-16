// Checks if the string contains a number
export function hasNumber(str: string): boolean {
  return /[0-9]/.test(str);
}

// Checks if the string contains an uppercase letter
export function hasUpperCase(str: string): boolean {
  return /[A-Z]/.test(str);
}

// Checks if the string contains a lowercase letter
export function hasLowerCase(str: string): boolean {
  return /[a-z]/.test(str);
}

// Checks if the string has a minimum length
export function hasLength(str: string, length: number): boolean {
  return str.length >= length;
}

// Checks if the string contains only letters and spaces
export function hasCharacter(str: string): boolean {
  return /^[a-zA-Z ]*$/.test(str);
}

//format to guid
export const formatToGuid = (id: string | null): string | null => {
  if (!id) return null;

  const uuidRegex =
    /^\{?[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}\}?$/;
  const rawRegex = /^[A-Fa-f0-9]{32}$/;

  if (uuidRegex.test(id)) {
    // Already in proper format or with optional {}
    return id.startsWith('{') && id.endsWith('}') ? id : `{${id}}`;
  }

  if (rawRegex.test(id)) {
    const formatted = `${id.substr(0, 8)}-${id.substr(8, 4)}-${id.substr(12, 4)}-${id.substr(
      16,
      4
    )}-${id.substr(20)}`;
    return `{${formatted}}`;
  }

  return id;
};

/**
 * Trims a string to the specified max length.
 * Optionally appends "…" if truncated.
 */
export function trimToLength(input: string, maxLength: number, addEllipsis = false): string {
  if (!input) return '';
  if (typeof(input) !== 'string') return '';

  if (input.length <= maxLength) {
    return input;
  }

  if (addEllipsis) {
    // Leave room for the ellipsis
    const safeLength = Math.max(0, maxLength - 1);
    return input.substring(0, safeLength).trimEnd() + '…';
  }

  return input.substring(0, maxLength).trimEnd();
}

export const formatToRawGuid = (id: string | null): string | null => {
  if (!id) return null;
  return id.replace(/{|}|-/g, '');
};
