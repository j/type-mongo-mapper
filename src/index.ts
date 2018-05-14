import { TypedConstructor } from './common/TypedConstructor';
import { map } from './mappers/map';
import { unmap } from './mappers/unmap';

export { TypedConstructor } from './common/TypedConstructor';
export { map } from './mappers/map';
export { unmap } from './mappers/unmap';
export * from './decorators';
export * from './metadata';

export type Map<T> = (doc: any) => T;
export type Unmap<T> = (obj: T) => any;

export function mapper<T>(
  DocumentClass: TypedConstructor<T> | Function
): { map: Map<T>; unmap: Unmap<T> } {
  return {
    map: (doc: any) => map(DocumentClass, doc),
    unmap: (obj: T | object) => unmap(obj)
  };
}
