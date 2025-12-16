export default function AddVwoFormTracking(fields) {
  const formId = parseGuid(fields?.metadata?.itemId);
  const formName = fields?.metadata?.name.replace(/\s+/g, '') || '';

  let result = {
    class: formId ? `dynform-${formId}` : '',
    'data-gpn-form-id': formId,
    'data-gpn-form-name': formName,
  };
  return result;
}

// Helper function to validate and parse GUID
function parseGuid(guidString) {
  const guidPattern =
    /^{?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}?$/;

  if (guidPattern.test(guidString)) {
    // Remove curly braces and dashes
    return guidString.replace(/[{}-]/g, '');
  }

  return null;
}
