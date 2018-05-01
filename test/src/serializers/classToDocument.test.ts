import { test } from 'ava';
import { ObjectID } from 'mongodb';
import {
  Document,
  EmbeddedDocument,
  EmbedMany,
  EmbedOne,
  Field
} from '../../../src/decorators';
import { EmbedManyAs } from '../../../src/metadata/index';
import { classToDocument } from '../../../src/serializers/classToDocument';

test('classToDocument() with simple class', async t => {
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

  const doc = classToDocument(user);

  t.false(doc instanceof User);
  t.deepEqual(doc, {
    _id: id,
    firstName: 'John',
    lastName: 'Doe'
  });
});

test('classToDocument() with @EmbeddedDocument', async t => {
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

  const doc = classToDocument(user);

  t.false(doc instanceof User);
  t.false(doc.address instanceof Address);
  t.deepEqual(doc, {
    _id: id,
    firstName: 'John',
    lastName: 'Doe',
    address: { city: 'San Diego', zip: 92107 }
  });
});

test('classToDocument() with array of @EmbeddedDocument', async t => {
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

  const doc = classToDocument(user);

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

test('classToDocument() with object of @EmbeddedDocument', async t => {
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

  const doc = classToDocument(user);

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

test('classToDocument() with Map of @EmbeddedDocument', async t => {
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

  const doc = classToDocument(user);

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

test('classToDocument() throws error when referencing another Document', async t => {
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
    classToDocument(jordy);
  });

  t.is(
    error.message,
    "Unable to map fields to other Documents. Use ObjectID's to reference another document."
  );
});

test('classToDocument() errors when class passed is not mapped', async t => {
  class User {}

  const error = t.throws(() => {
    classToDocument(new User());
  });

  t.is(
    error.message,
    'Object passed to "classToDocument" is not a valid mapped document.'
  );
});
