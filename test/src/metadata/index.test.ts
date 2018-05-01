import { test } from 'ava';

import {
  defineDocumentMetadata,
  DocumentMetadataType,
  getDocumentMetadata
} from '../../../src';
import { processAndValidateMetadata } from '../../../src/metadata/index';

test('getDocumentMetadata() gets defined metadata', t => {
  class User {}

  defineDocumentMetadata(User);

  const meta = getDocumentMetadata(User);

  t.deepEqual(meta, {
    target: User,
    fields: {},
    isProcessed: false,
    type: DocumentMetadataType.DOCUMENT
  });
});

test('processAndValidateMetadata() throws error on incompatible types', t => {
  class Base {}
  class User extends Base {}

  defineDocumentMetadata(Base, DocumentMetadataType.EMBEDDED_DOCUMENT);
  defineDocumentMetadata(User);

  const meta = getDocumentMetadata(User);

  const error = t.throws(() => {
    processAndValidateMetadata(meta);
  });

  t.is(error.message, '"User" extends "Base" which are incompatible types.');
});

test("processAndValidateMetadata() throws error when base's base is incompatible", t => {
  class BaseBase {}
  class Base extends BaseBase {}
  class User extends Base {}

  defineDocumentMetadata(BaseBase, DocumentMetadataType.EMBEDDED_DOCUMENT);
  defineDocumentMetadata(Base);
  defineDocumentMetadata(User);

  const meta = getDocumentMetadata(User);

  const error = t.throws(() => {
    processAndValidateMetadata(meta);
  });

  t.is(
    error.message,
    '"User" extends "BaseBase" which are incompatible types.'
  );
});

test('processAndValidateMetadata() throws error when metadata is invalid', t => {
  const error = t.throws(() => {
    processAndValidateMetadata(null);
  });

  t.is(
    error.message,
    'Value passed to "processAndValidateMetadata" is not a valid DocumentMetadata.'
  );
});
