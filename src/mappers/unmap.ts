import {
  DocumentMetadataFieldType,
  getDocumentMetadata,
  isDocument,
  processAndValidateMetadata
} from '../metadata';
import { eachInMapOrObject } from '../util/eachInMapOrObject';
import { hasConstructor } from '../util/hasConstructor';

/**
 * Expects "object" to be a class with document metadata.
 *
 * This outputs an object that is valid for MongoDB.
 */
export function unmap<T>(object: T): any {
  if (
    typeof object === 'object' &&
    object.constructor &&
    !isDocument(object.constructor)
  ) {
    throw new Error('Object passed to "unmap" is not a valid mapped document.');
  }

  return process(object);
}

function process<T>(object: T): any {
  const meta = getDocumentMetadata(object.constructor);

  processAndValidateMetadata(meta);

  const keys = Object.keys(object);

  const doc: any = {};

  keys.forEach(key => {
    const value: any = object[key];

    if (hasConstructor(value) && isDocument(value.constructor)) {
      throw new Error(
        "Unable to map fields to other Documents. Use ObjectID's to reference another document."
      );
    }

    const embedFieldMeta = meta.fields[key];

    if (embedFieldMeta) {
      switch (embedFieldMeta.type) {
        case DocumentMetadataFieldType.FIELD:
          doc[key] = value;
          break;
        case DocumentMetadataFieldType.EMBED_ONE:
          doc[key] = process(value);
          break;
        case DocumentMetadataFieldType.EMBED_ARRAY:
          doc[key] = value.map(process);
          break;
        case DocumentMetadataFieldType.EMBED_MAP:
        case DocumentMetadataFieldType.EMBED_OBJECT:
          doc[key] = eachInMapOrObject(value, (_: string, v: any) =>
            process(v)
          );
          break;
      }
    }
  });

  return doc;
}
