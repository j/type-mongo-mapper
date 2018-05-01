function processMap(map: Map<any, any>, fn: (k: string, v: any) => any) {
  const value = {};

  for (const [k, v] of map.entries()) {
    value[k] = fn(k, v);
  }

  return value;
}

function processObject(
  object: { [key: string]: any },
  fn: (k: string, v: any) => any
) {
  const value = {};

  for (const k in object) {
    /* istanbul ignore else */
    if (object.hasOwnProperty(k)) {
      value[k] = fn(k, object[k]);
    }
  }

  return value;
}

export function eachInMapOrObject(
  mapOrObject: Map<any, any> | { [key: string]: any },
  fn: (k: string, v: any) => any
) {
  if (mapOrObject instanceof Map) {
    return processMap(mapOrObject, fn);
  }

  if (typeof mapOrObject === 'object') {
    return processObject(mapOrObject, fn);
  }

  throw new Error('eachInMapOrObject() expects a Map or plain object.');
}
