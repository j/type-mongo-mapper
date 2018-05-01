export function isPrimitive(value: any): boolean {
  switch (typeof value) {
    case 'boolean':
    case 'number':
    case 'string':
    case 'symbol':
    case 'undefined':
      return true;
    default: {
      return value === null;
    }
  }
}
