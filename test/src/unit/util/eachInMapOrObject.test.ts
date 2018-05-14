import { test } from 'ava';

import { eachInMapOrObject } from '../../../../src/util/eachInMapOrObject';

test('eachInMapOrObject() errors when invalid arguments are passed', t => {
  let iShouldBeFalse = false;

  t.throws(() => {
    // @ts-ignore
    eachInMapOrObject('hello', (): any => {
      iShouldBeFalse = true;

      return;
    });
  });

  t.false(iShouldBeFalse);
});
