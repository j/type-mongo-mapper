import {
  CreateEmbedTypeFunction,
  defineDocumentMetadata,
  defineDocumentMetadataEmbeddedField,
  defineDocumentMetadataField,
  DocumentMetadataType,
  EmbedManyAs
} from '../metadata';

export { EmbedManyAs } from '../metadata';

export function Document(): ClassDecorator {
  return (target: Function): void => {
    defineDocumentMetadata(target, DocumentMetadataType.DOCUMENT);
  };
}

export function EmbeddedDocument(): ClassDecorator {
  return (target: Function): void => {
    defineDocumentMetadata(target, DocumentMetadataType.EMBEDDED_DOCUMENT);
  };
}

export function Field(): PropertyDecorator {
  return (target: Function, propertyKey: string): void => {
    defineDocumentMetadataField(target.constructor, propertyKey);
  };
}

export function EmbedOne<T>(
  typeFn: CreateEmbedTypeFunction<T>
): PropertyDecorator {
  return (target: Function, propertyKey: string): void => {
    defineDocumentMetadataEmbeddedField(
      target.constructor,
      propertyKey,
      typeFn
    );
  };
}

export function EmbedMany<T>(
  typeFn: CreateEmbedTypeFunction<T>,
  embedManyAs: EmbedManyAs = EmbedManyAs.ARRAY
): PropertyDecorator {
  return (target: Function, propertyKey: string): void => {
    defineDocumentMetadataEmbeddedField(
      target.constructor,
      propertyKey,
      typeFn,
      embedManyAs
    );
  };
}
