import { test } from 'ava';
import { ObjectID } from 'mongodb';
import {
  Document,
  EmbeddedDocument,
  EmbedMany,
  EmbedOne,
  Field
} from '../../../../src/decorators';
import { unmap } from '../../../../src/mappers/unmap';
import { EmbedManyAs } from '../../../../src/metadata/index';

test('unmap() with simple class', async t => {
  const id = new ObjectID();

  @Document()
  class User {
    @Field() public _id: ObjectID;
    @Field() public firstName: string;
    @Field() public lastName: string;
  }

  const user = new User();
  user._id = id;
  user.firstName = 'John';
  user.lastName = 'Doe';

  const doc = unmap(user);

  t.false(doc instanceof User);
  t.deepEqual(doc, {
    _id: id,
    firstName: 'John',
    lastName: 'Doe'
  });
});

test('unmap() with @EmbeddedDocument', async t => {
  const id = new ObjectID();

  @EmbeddedDocument()
  class Address {
    @Field() public city: string;
    @Field() public zip: number;

    constructor(city: string, zip: number) {
      this.city = city;
      this.zip = zip;
    }
  }

  @Document()
  class User {
    @Field() public _id: ObjectID;
    @Field() public firstName: string;
    @Field() public lastName: string;

    @EmbedOne(() => Address)
    public address: Address;
  }

  const user = new User();
  user._id = id;
  user.firstName = 'John';
  user.lastName = 'Doe';
  user.address = new Address('San Diego', 92107);

  const doc = unmap(user);

  t.false(doc instanceof User);
  t.false(doc.address instanceof Address);
  t.deepEqual(doc, {
    _id: id,
    firstName: 'John',
    lastName: 'Doe',
    address: { city: 'San Diego', zip: 92107 }
  });
});

test('unmap() with array of @EmbeddedDocument', async t => {
  const id = new ObjectID();

  @EmbeddedDocument()
  class Address {
    @Field() public city: string;
    @Field() public zip: number;

    constructor(city: string, zip: number) {
      this.city = city;
      this.zip = zip;
    }
  }

  @Document()
  class User {
    @Field() public _id: ObjectID;
    @Field() public firstName: string;
    @Field() public lastName: string;

    @EmbedMany(() => Address)
    public addresses: Address[] = [];
  }

  const user = new User();
  user._id = id;
  user.firstName = 'John';
  user.lastName = 'Doe';
  user.addresses = [
    new Address('San Diego', 92107),
    new Address('Carlsbad', 92008)
  ];

  const doc = unmap(user);

  t.false(doc instanceof User);
  t.false(doc.addresses[0] instanceof Address);
  t.false(doc.addresses[1] instanceof Address);
  t.deepEqual(doc, {
    _id: id,
    firstName: 'John',
    lastName: 'Doe',
    addresses: [
      { city: 'San Diego', zip: 92107 },
      { city: 'Carlsbad', zip: 92008 }
    ]
  });
});

test('unmap() with object of @EmbeddedDocument', async t => {
  const id = new ObjectID();

  @EmbeddedDocument()
  class Address {
    @Field() public city: string;
    @Field() public zip: number;

    constructor(city: string, zip: number) {
      this.city = city;
      this.zip = zip;
    }
  }

  @Document()
  class User {
    @Field() public _id: ObjectID;
    @Field() public firstName: string;
    @Field() public lastName: string;

    @EmbedMany(() => Address, EmbedManyAs.OBJECT)
    public addresses: { [key: string]: Address };
  }

  const user = new User();
  user._id = id;
  user.firstName = 'John';
  user.lastName = 'Doe';
  user.addresses = {
    home: new Address('San Diego', 92107),
    office: new Address('Carlsbad', 92008)
  };

  const doc = unmap(user);

  t.false(doc instanceof User);
  t.false(doc.addresses.home instanceof Address);
  t.false(doc.addresses.office instanceof Address);
  t.deepEqual(doc, {
    _id: id,
    firstName: 'John',
    lastName: 'Doe',
    addresses: {
      home: { city: 'San Diego', zip: 92107 },
      office: { city: 'Carlsbad', zip: 92008 }
    }
  });
});

test('unmap() with Map of @EmbeddedDocument', async t => {
  const id = new ObjectID();

  @EmbeddedDocument()
  class Address {
    @Field() public city: string;
    @Field() public zip: number;

    constructor(city: string, zip: number) {
      this.city = city;
      this.zip = zip;
    }
  }

  @Document()
  class User {
    @Field() public _id: ObjectID;
    @Field() public firstName: string;
    @Field() public lastName: string;

    @EmbedMany(() => Address, EmbedManyAs.MAP)
    public addresses: Map<string, Address> = new Map<string, Address>();
  }

  const user = new User();
  user._id = id;
  user.firstName = 'John';
  user.lastName = 'Doe';
  user.addresses.set('home', new Address('San Diego', 92107));
  user.addresses.set('office', new Address('Carlsbad', 92008));

  const doc = unmap(user);

  t.false(doc instanceof User);
  t.false(doc.addresses.home instanceof Address);
  t.false(doc.addresses.office instanceof Address);
  t.deepEqual(doc, {
    _id: id,
    firstName: 'John',
    lastName: 'Doe',
    addresses: {
      home: { city: 'San Diego', zip: 92107 },
      office: { city: 'Carlsbad', zip: 92008 }
    }
  });
});

test('unmap() throws error when referencing another Document', async t => {
  const id1 = new ObjectID();
  const id2 = new ObjectID();

  @Document()
  class User {
    @Field() public _id: ObjectID;
    @Field() public firstName: string;
    @Field() public lastName: string;
    @Field() public bestFriend: User;
  }

  const john = new User();
  john._id = id1;
  john.firstName = 'John';
  john.lastName = 'Florence';

  const jordy = new User();
  jordy._id = id2;
  jordy.firstName = 'Jordy';
  jordy.lastName = 'Smith';
  jordy.bestFriend = john;

  const error = t.throws(() => {
    unmap(jordy);
  });

  t.is(
    error.message,
    "Unable to map fields to other Documents. Use ObjectID's to reference another document."
  );
});

test('unmap() ignores doc field that is not mapped', async t => {
  const id = new ObjectID();

  @Document()
  class User {
    @Field() public _id: ObjectID;

    @Field() public firstName: string;

    public lastName: string;
  }

  const user = new User();
  user._id = id;
  user.firstName = 'John';
  user.lastName = 'Doe';

  const doc = unmap(user);

  t.false(doc instanceof User);
  t.deepEqual(doc, {
    _id: id,
    firstName: 'John'
  });
});

test('unmap() nested inheritance', async t => {
  @Document()
  class BaseBaseDocument {
    @Field() public _id: ObjectID;
  }

  @Document()
  class BaseDocument extends BaseBaseDocument {
    @Field() public createdAt: Date;
    @Field() public updatedAt: Date;
  }

  @Document()
  class User extends BaseDocument {
    @Field() public firstName: string;
    @Field() public lastName: string;
  }

  const id = new ObjectID();
  const createdAt = new Date();
  const updatedAt = new Date();

  const user = new User();
  user._id = id;
  user.firstName = 'John';
  user.lastName = 'Doe';
  user.createdAt = createdAt;
  user.updatedAt = updatedAt;

  const doc = unmap(user);

  t.false(doc instanceof User);
  t.deepEqual(doc, {
    _id: id,
    firstName: 'John',
    lastName: 'Doe',
    createdAt,
    updatedAt
  });
});

test('unmap() errors on incompatible inheritance type', async t => {
  @EmbeddedDocument()
  class BaseDocument {
    @Field() public _id: ObjectID;
  }

  @Document()
  class User extends BaseDocument {
    @Field() public firstName: string;
    @Field() public lastName: string;
  }

  const user = new User();
  user._id = new ObjectID();
  user.firstName = 'John';
  user.lastName = 'Doe';

  const error = t.throws(() => unmap(user));

  t.is(
    error.message,
    '"User" extends "BaseDocument" which are incompatible types.'
  );
});

test('unmap() errors when class passed is not mapped', async t => {
  class User {}

  const error = t.throws(() => {
    unmap(new User());
  });

  t.is(
    error.message,
    'Object passed to "unmap" is not a valid mapped document.'
  );
});
