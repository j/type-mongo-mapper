function isObject(value: any): boolean {
  return (
    value != null &&
    typeof value === 'object' &&
    Array.isArray(value) === false &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

export function isPlainObject(value: any): any {
  if (!isObject(value)) {
    return false;
  }

  const ctor = value.constructor;
  const proto = ctor.prototype;

  if (typeof ctor !== 'function') {
    return false;
  }

  if (isObject(proto) === false) {
    return false;
  }

  if (proto.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  return true;
}
