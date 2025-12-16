export const highlightKeyword = (
  text: string,
  keyword: string,
  highlightTag = 'strong'
): string => {
  try {
    if (!text.trim() || !keyword.trim()) return text;

    const escapedKeyword = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedKeyword})`, 'gi');

    return text.replace(regex, `<${highlightTag}>$1</${highlightTag}>`);
  } catch {
    return text; // Return original text if an error occurs
  }
};
