import { test } from 'ava';
import { Collection, ObjectID } from 'mongodb';
import { Document, Field, map } from '../../../src';
import { getCollection } from '../testUtils';

@Document()
class User {
  @Field() public _id: ObjectID;
  @Field() public firstName: string;
  @Field() public lastName: string;
}

async function prepareFixtures(collection: Collection): Promise<void> {
  const jordy = map(User, {
    _id: new ObjectID('507f1f77bcf86cd799439010'),
    firstName: 'Jordy',
    lastName: 'Smith'
  });

  const kelly = map(User, {
    _id: new ObjectID('507f1f77bcf86cd799439011'),
    firstName: 'Kelly',
    lastName: 'Slater'
  });

  await collection.insertMany([jordy, kelly]);
}

test('collection.findOne()', async t => {
  const collection = await getCollection(User, 'collection_findOne');

  await prepareFixtures(collection);

  const found = await collection.findOne({
    _id: new ObjectID('507f1f77bcf86cd799439010')
  });
  t.true(found instanceof User);
  t.is(found.firstName, 'Jordy');
  t.is(found.lastName, 'Smith');
});

test('collection.find()', async t => {
  const collection = await getCollection(User, 'collection_find');

  await prepareFixtures(collection);

  const users = await collection
    .find()
    .sort({ firstName: 1 })
    .toArray();
  t.true(users[0] instanceof User);
  t.is(users[0].firstName, 'Jordy');
  t.is(users[0].lastName, 'Smith');

  t.true(users[1] instanceof User);
  t.is(users[1].firstName, 'Kelly');
  t.is(users[1].lastName, 'Slater');
});

test('collection.insertOne()', async t => {
  const collection = await getCollection(User, 'collection_insertOne');

  const john = new User();
  john._id = new ObjectID();
  john.firstName = 'John';
  john.lastName = 'Doe';

  t.is(await collection.count({}), 0);
  await collection.insertOne(john);
  t.is(await collection.count({}), 1);

  const found = await collection.find().toArray();

  t.is(found[0]._id.toHexString(), john._id.toHexString());
  t.is(found[0].firstName, 'John');
  t.is(found[0].lastName, 'Doe');
});

test('collection.replaceOne()', async t => {
  const collection = await getCollection(User, 'collection_replaceOne');

  await prepareFixtures(collection);

  const jordyId = new ObjectID('507f1f77bcf86cd799439010');

  const john = new User();
  john._id = jordyId;
  john.firstName = 'John';
  john.lastName = 'Doe';

  await collection.replaceOne({ _id: jordyId }, john);

  const found = await collection.findOne({ _id: jordyId });

  t.is(found._id.toHexString(), jordyId.toHexString());
  t.is(found.firstName, 'John');
  t.is(found.lastName, 'Doe');
});

test('collection.findOneAndReplace()', async t => {
  const collection = await getCollection(User, 'collection_findOneAndReplace');

  await prepareFixtures(collection);

  const jordyId = new ObjectID('507f1f77bcf86cd799439010');

  const john = new User();
  john._id = jordyId;
  john.firstName = 'John';
  john.lastName = 'Doe';

  await collection.findOneAndReplace({ _id: jordyId }, john);

  const found = await collection.findOne({ _id: jordyId });

  t.is(found._id.toHexString(), jordyId.toHexString());
  t.is(found.firstName, 'John');
  t.is(found.lastName, 'Doe');
});
