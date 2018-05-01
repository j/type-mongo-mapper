import { isPrimitive } from './isPrimitive';

export function isMongoValue(value: any): boolean {
  if (!value) {
    return true;
  }

  if (typeof value._bsontype !== 'undefined' || value instanceof Date) {
    return true;
  }

  return isPrimitive(value);
}
