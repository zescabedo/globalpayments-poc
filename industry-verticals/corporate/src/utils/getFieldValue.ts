import { Field } from "@sitecore-jss/sitecore-jss-nextjs";

const getFieldValue = (field: Field | string | undefined): string | undefined => {
  if (!field) return undefined;
  
  // If it's a string, return it directly
  if (typeof field === 'string') {
    return field || undefined;
  }
  
  // If it's an object with a value property
  if (typeof field === 'object' && field !== null && 'value' in field) {
    const value = (field as Field).value;
    // Handle the case where value is an empty string or null
    return (typeof value === 'string' && value.trim() !== '') ? value : undefined;
  }
  
  return undefined;
};

export default getFieldValue;