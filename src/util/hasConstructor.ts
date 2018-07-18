function isObject(value) {
  const type = typeof value;

  return value !== null && (type === 'object' || type === 'function');
}

export function hasConstructor(value) {
  if (!isObject(value)) {
    return false;
  }

  return typeof value.constructor === 'function';
}
