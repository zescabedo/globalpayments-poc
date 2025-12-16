import { OPERATORS } from '@/constants/conditionalConstants';

export function evaluateCondition(
  fieldValue: string,
  operatorId: string,
  expectedValue: string
): boolean {
  switch (operatorId) {
    case OPERATORS.EQUALS:
      return fieldValue === expectedValue;

    case OPERATORS.NOT_EQUALS:
      return fieldValue !== expectedValue;

    case OPERATORS.CONTAINS:
      return fieldValue.includes(expectedValue);

    case OPERATORS.NOT_CONTAINS:
      return !fieldValue.includes(expectedValue);

    case OPERATORS.START_WITH:
      return fieldValue.startsWith(expectedValue);

    case OPERATORS.NOT_START_WITH:
      return !fieldValue.startsWith(expectedValue);

    case OPERATORS.END_WITH:
      return fieldValue.endsWith(expectedValue);

    case OPERATORS.NOT_END_WITH:
      return !fieldValue.endsWith(expectedValue);

    case OPERATORS.GREATER_THAN:
      return parseFloat(fieldValue) > parseFloat(expectedValue);

    case OPERATORS.NOT_GREATER_THAN:
      return parseFloat(fieldValue) <= parseFloat(expectedValue);

    case OPERATORS.LESS_THAN:
      return parseFloat(fieldValue) < parseFloat(expectedValue);

    case OPERATORS.LESS_THAN_OR_EQUAL:
      return parseFloat(fieldValue) <= parseFloat(expectedValue);

    default:
      return false;
  }
}
