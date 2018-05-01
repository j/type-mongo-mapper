import 'reflect-metadata';
import { TypedConstructor } from '../common/TypedConstructor';

/**
 * The key used for the reflect metadata.
 */
const DOCUMENT_METADATA_KEY = Symbol('DOCUMENT_METADATA_KEY');

export type CreateEmbedTypeFunctionReturn<T> = TypedConstructor<T> | Function;
export type CreateEmbedTypeFunction<T> = (
  doc: any
) => CreateEmbedTypeFunctionReturn<T>;

/**
 * Many embedded documents can be a normal array, map, or key/value object.
 */
export enum EmbedManyAs {
  MAP = 'map',
  ARRAY = 'array',
  OBJECT = 'object'
}

/**
 * Whether or not the class is a document or embedded document.
 */
export enum DocumentMetadataType {
  DOCUMENT = 'DOCUMENT',
  EMBEDDED_DOCUMENT = 'EMBEDDED_DOCUMENT'
}

/**
 * Whether it's a normal field or embedded document(s).
 */
export enum DocumentMetadataFieldType {
  FIELD = 'FIELD',
  EMBED_ONE = 'EMBED_ONE',
  EMBED_ARRAY = 'EMBED_ARRAY',
  EMBED_MAP = 'EMBED_MAP',
  EMBED_OBJECT = 'EMBED_OBJECT'
}

/**
 * DocumentMetadata contains all the information about classes that get mapped to MongoDB documents.
 */
export interface DocumentMetadata {
  /**
   * The base document class.
   */
  target: any;

  /**
   * Flag whether the metadata has been processed or not.
   */
  isProcessed: boolean;

  /**
   * Is this a Document or Embedded Document?
   */
  type?: DocumentMetadataType;

  /**
   * The property to document field mappings.
   */
  fields?: { [name: string]: DocumentMetadataField };

  /**
   * If the class extends another.
   */
  parent?: any;
}

/**
 * The document or embedded document field options.
 */
export interface DocumentMetadataField {
  /**
   * Whether it's a normal field or embedded document(s).
   */
  type: DocumentMetadataFieldType;

  /**
   * The reflect "design:type" for later use.
   */
  designType: any;

  /**
   * This option is required on embedded field types.
   */
  createEmbeddedInstance?: <T>(doc: any) => T;
}

/**
 * Registers the given class as a document or embedded document.
 */
export function defineDocumentMetadata<T>(
  DocumentClass: TypedConstructor<T> | Function,
  type: DocumentMetadataType = DocumentMetadataType.DOCUMENT
): void {
  const meta = getOrCreateDocumentMetadata(DocumentClass);

  meta.type = type;
}

/**
 * Define's a mapped field for a document or embedded document.
 */
export function defineDocumentMetadataField<T>(
  DocumentClass: TypedConstructor<T> | Function,
  name: string,
  opts: Partial<DocumentMetadataField> = {}
): void {
  const meta = getOrCreateDocumentMetadata(DocumentClass);

  meta.fields[name] = {
    type: DocumentMetadataFieldType.FIELD,
    ...opts,
    designType: Reflect.getMetadata(
      'design:type',
      DocumentClass.prototype,
      name
    )
  };
}

/**
 * Define's a mapped field for a document or embedded document.
 */
export function defineDocumentMetadataEmbeddedField<T>(
  DocumentClass: TypedConstructor<T> | Function,
  name: string,
  createEmbedType: <E>(doc: any) => CreateEmbedTypeFunctionReturn<E>,
  embedManyAs?: EmbedManyAs
): void {
  // if `embedManyAs` is not defined, treat it as a single embed.
  let type = DocumentMetadataFieldType.EMBED_ONE;

  if (type) {
    switch (embedManyAs) {
      case EmbedManyAs.MAP:
        type = DocumentMetadataFieldType.EMBED_MAP;
        break;
      case EmbedManyAs.OBJECT:
        type = DocumentMetadataFieldType.EMBED_OBJECT;
        break;
      case EmbedManyAs.ARRAY:
        type = DocumentMetadataFieldType.EMBED_ARRAY;
        break;
    }
  }

  // creates an instance of the @EmbeddedDocument class.
  const createEmbeddedInstance = <EmbeddedClass>(doc: any): EmbeddedClass => {
    const ClassCtor = createEmbedType(doc);

    if (!isEmbeddedDocument(ClassCtor)) {
      throw new Error(
        `Class "${ClassCtor.name}" is not a valid embedded document.`
      );
    }

    return new (ClassCtor as TypedConstructor<EmbeddedClass>)();
  };

  const opts: Partial<DocumentMetadataField> = {
    type,
    createEmbeddedInstance
  };

  defineDocumentMetadataField(DocumentClass, name, opts);
}

function getOrCreateDocumentMetadata<T>(
  DocumentClass: TypedConstructor<T> | Function
): DocumentMetadata {
  let meta = Reflect.getOwnMetadata(DOCUMENT_METADATA_KEY, DocumentClass);

  if (!meta) {
    meta = {
      target: DocumentClass,
      fields: {},
      isProcessed: false
    };

    Reflect.defineMetadata(DOCUMENT_METADATA_KEY, meta, DocumentClass);
  }

  const parentProto = Object.getPrototypeOf(DocumentClass.prototype);
  const parentMeta = parentProto
    ? getDocumentMetadata(parentProto.constructor)
    : false;
  if (parentMeta) {
    meta.parent = parentMeta;
  }

  return meta;
}

/**
 * Returns true if the given class is a document.
 */
export function isDocument<T>(
  EmbeddedDocumentClass: TypedConstructor<T> | Function
): boolean {
  const meta = Reflect.getOwnMetadata(
    DOCUMENT_METADATA_KEY,
    EmbeddedDocumentClass
  );

  return meta && meta.type === DocumentMetadataType.DOCUMENT;
}

/**
 * Returns true if the given class is an embedded document.
 */
export function isEmbeddedDocument<T>(
  EmbeddedDocumentClass: TypedConstructor<T> | Function
): boolean {
  const meta = Reflect.getOwnMetadata(
    DOCUMENT_METADATA_KEY,
    EmbeddedDocumentClass
  );

  return meta && meta.type === DocumentMetadataType.EMBEDDED_DOCUMENT;
}

/**
 * Gets the document metadata for documents or embedded documents
 */
export function getDocumentMetadata<T>(
  DocumentClass: TypedConstructor<T> | Function
): DocumentMetadata {
  return Reflect.getOwnMetadata(DOCUMENT_METADATA_KEY, DocumentClass);
}

/**
 * Merges parent's fields into the upper-most document.
 */
export function processAndValidateMetadata(meta: DocumentMetadata): void {
  if (meta.isProcessed) {
    return;
  }

  let parent = meta.parent;

  while (parent) {
    if (parent.type !== meta.type) {
      throw new Error(
        `"${meta.target.name}" extends "${
          parent.target.name
        }" which are incompatible types.`
      );
    }

    Object.keys(parent.fields).forEach(field => {
      if (!meta.fields[field]) {
        meta.fields[field] = parent.fields[field];
      }
    });

    parent = parent.parent;
  }

  meta.isProcessed = true;
}
