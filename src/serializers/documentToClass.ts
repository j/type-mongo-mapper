import { TypedConstructor } from '../common/TypedConstructor';
import {
  DocumentMetadataFieldType,
  getDocumentMetadata,
  isDocument,
  processAndValidateMetadata
} from '../metadata';
import { eachInMapOrObject } from '../util/eachInMapOrObject';

/**
 * Expects "objOrCtor" to be a class or instance of a class with document metadata.
 *
 * This maps the document to the class.
 */
export function documentToClass<T>(
  objOrCtor: T | TypedConstructor<T>,
  doc: any
): T {
  let object: T;

  if (isDocument(objOrCtor as TypedConstructor<T>)) {
    object = new (objOrCtor as TypedConstructor<T>)();
  } else {
    if (!isDocument(objOrCtor.constructor)) {
      throw new Error(
        'Object passed to "documentToClass" is not a valid mapped document.'
      );
    }

    object = objOrCtor as T;
  }

  return process(object, doc);
}

function process<T>(object: T, doc: any): T {
  const meta =
    object && object.constructor
      ? getDocumentMetadata(object.constructor)
      : null;

  processAndValidateMetadata(meta);

  const fields = Object.keys(doc);

  fields.forEach(field => {
    const value: any = doc[field];
    const fieldMeta = meta.fields[field];

    if (fieldMeta) {
      switch (fieldMeta.type) {
        case DocumentMetadataFieldType.FIELD:
          object[field] = value;
          break;
        case DocumentMetadataFieldType.EMBED_ONE:
          object[field] = process(
            fieldMeta.createEmbeddedInstance(value),
            value
          );
          break;
        case DocumentMetadataFieldType.EMBED_ARRAY:
          object[field] = value.map(item =>
            process(fieldMeta.createEmbeddedInstance(item), item)
          );
          break;
        case DocumentMetadataFieldType.EMBED_OBJECT:
          object[field] = eachInMapOrObject(
            value,
            (_: string, item: any): any =>
              process(fieldMeta.createEmbeddedInstance(item), item)
          );
          break;
        case DocumentMetadataFieldType.EMBED_MAP:
          const map = new Map<any, any>();

          eachInMapOrObject(value, (k: string, item: any): any => {
            map.set(k, process(fieldMeta.createEmbeddedInstance(item), item));
          });

          object[field] = map;
          break;
      }
    }
  });

  return object;
}
