import { test } from 'ava';
import { ObjectID } from 'mongodb';
import {
  Document,
  EmbeddedDocument,
  EmbedMany,
  EmbedManyAs,
  EmbedOne,
  Field
} from '../../../src/decorators';
import { documentToClass } from '../../../src/serializers/documentToClass';

test('documentToClass() with simple class', async t => {
  @Document()
  class User {
    @Field() public _id: ObjectID;
    @Field() public firstName: string;
    @Field() public lastName: string;
  }

  const doc = {
    _id: new ObjectID('507f1f77bcf86cd799439011'),
    firstName: 'Jordy',
    lastName: 'Smith'
  };

  const user = documentToClass(User, doc);

  t.true(user instanceof User);
  t.is(user._id.toHexString(), '507f1f77bcf86cd799439011');
  t.is(user.firstName, 'Jordy');
  t.is(user.lastName, 'Smith');
});

test('documentToClass() with simple instantiated class', async t => {
  @Document()
  class User {
    @Field() public _id: ObjectID;
    @Field() public firstName: string;
    @Field() public lastName: string;
  }

  const doc = {
    _id: new ObjectID('507f1f77bcf86cd799439011'),
    lastName: 'Smith'
  };

  const instantiated = new User();
  instantiated.firstName = 'John';

  const user = documentToClass(instantiated, doc);

  t.true(user === instantiated);
  t.true(user instanceof User);
  t.is(user._id.toHexString(), '507f1f77bcf86cd799439011');
  t.is(user.firstName, 'John');
  t.is(user.lastName, 'Smith');
});

test('documentToClass() with @EmbedOne()', async t => {
  @EmbeddedDocument()
  class Address {
    @Field() public city: string;
    @Field() public zip: number;
  }

  @Document()
  class User {
    @Field() public _id: ObjectID;
    @Field() public firstName: string;
    @Field() public lastName: string;

    @EmbedOne(() => Address)
    public address: Address;
  }

  const doc = {
    _id: new ObjectID('507f1f77bcf86cd799439011'),
    firstName: 'Jordy',
    lastName: 'Smith',
    address: {
      city: 'San Diego',
      zip: 92107
    }
  };

  const user = documentToClass(User, doc);

  t.true(user instanceof User);
  t.true(user.address instanceof Address);
  t.is(user._id.toHexString(), '507f1f77bcf86cd799439011');
  t.is(user.firstName, 'Jordy');
  t.is(user.lastName, 'Smith');
  t.is(user.address.city, 'San Diego');
  t.is(user.address.zip, 92107);
});

test('documentToClass() with @EmbedMany()', async t => {
  @EmbeddedDocument()
  class Address {
    @Field() public city: string;
    @Field() public zip: number;
  }

  @Document()
  class User {
    @Field() public _id: ObjectID;
    @Field() public firstName: string;
    @Field() public lastName: string;

    @EmbedMany(() => Address)
    public addresses: Address[];
  }

  const doc = {
    _id: new ObjectID('507f1f77bcf86cd799439011'),
    firstName: 'Jordy',
    lastName: 'Smith',
    addresses: [
      {
        city: 'San Diego',
        zip: 92107
      },
      {
        city: 'Carlsbad',
        zip: 92008
      }
    ]
  };

  const user = documentToClass(User, doc);

  t.true(user instanceof User);
  t.true(user.addresses[0] instanceof Address);
  t.true(user.addresses[1] instanceof Address);
  t.is(user._id.toHexString(), '507f1f77bcf86cd799439011');
  t.is(user.firstName, 'Jordy');
  t.is(user.lastName, 'Smith');
  t.is(user.addresses[0].city, 'San Diego');
  t.is(user.addresses[0].zip, 92107);
  t.is(user.addresses[1].city, 'Carlsbad');
  t.is(user.addresses[1].zip, 92008);
});

test('documentToClass() with @EmbedMany() as object', async t => {
  @EmbeddedDocument()
  class Address {
    @Field() public city: string;
    @Field() public zip: number;
  }

  @Document()
  class User {
    @Field() public _id: ObjectID;
    @Field() public firstName: string;
    @Field() public lastName: string;

    @EmbedMany(() => Address, EmbedManyAs.OBJECT)
    public addresses: { [key: string]: Address };
  }

  const doc = {
    _id: new ObjectID('507f1f77bcf86cd799439011'),
    firstName: 'Jordy',
    lastName: 'Smith',
    addresses: {
      home: {
        city: 'San Diego',
        zip: 92107
      },
      office: {
        city: 'Carlsbad',
        zip: 92008
      }
    }
  };

  const user = documentToClass(User, doc);

  t.true(user instanceof User);
  t.false(user.addresses instanceof Map);
  t.true(user.addresses.home instanceof Address);
  t.true(user.addresses.office instanceof Address);
  t.is(user._id.toHexString(), '507f1f77bcf86cd799439011');
  t.is(user.firstName, 'Jordy');
  t.is(user.lastName, 'Smith');
  t.is(user.addresses.home.city, 'San Diego');
  t.is(user.addresses.home.zip, 92107);
  t.is(user.addresses.office.city, 'Carlsbad');
  t.is(user.addresses.office.zip, 92008);
});

test('documentToClass() with @EmbedMany() as map', async t => {
  @EmbeddedDocument()
  class Address {
    @Field() public city: string;
    @Field() public zip: number;
  }

  @Document()
  class User {
    @Field() public _id: ObjectID;
    @Field() public firstName: string;
    @Field() public lastName: string;

    @EmbedMany(() => Address, EmbedManyAs.MAP)
    public addresses: Map<string, Address> = new Map<string, Address>();
  }

  const doc = {
    _id: new ObjectID('507f1f77bcf86cd799439011'),
    firstName: 'Jordy',
    lastName: 'Smith',
    addresses: {
      home: {
        city: 'San Diego',
        zip: 92107
      },
      office: {
        city: 'Carlsbad',
        zip: 92008
      }
    }
  };

  const user = documentToClass(User, doc);

  t.true(user instanceof User);
  t.true(user.addresses instanceof Map);
  t.true(user.addresses.get('home') instanceof Address);
  t.true(user.addresses.get('office') instanceof Address);
  t.is(user._id.toHexString(), '507f1f77bcf86cd799439011');
  t.is(user.firstName, 'Jordy');
  t.is(user.lastName, 'Smith');
  t.is(user.addresses.get('home').city, 'San Diego');
  t.is(user.addresses.get('home').zip, 92107);
  t.is(user.addresses.get('office').city, 'Carlsbad');
  t.is(user.addresses.get('office').zip, 92008);
});

test('documentToClass() errors when @EmbedOne() has an unmapped type', async t => {
  class Address {
    @Field() public city: string;
    @Field() public zip: number;
  }

  @Document()
  class User {
    @Field() public _id: ObjectID;
    @Field() public firstName: string;
    @Field() public lastName: string;

    @EmbedOne(() => Address)
    public address: Address;
  }

  const doc = {
    _id: new ObjectID('507f1f77bcf86cd799439011'),
    firstName: 'Jordy',
    lastName: 'Smith',
    address: {
      city: 'San Diego',
      zip: 92107
    }
  };

  const error = t.throws(() => {
    documentToClass(User, doc);
  });

  t.is(error.message, 'Class "Address" is not a valid embedded document.');
});

test('documentToClass() with @EmbedOne() as a discriminator type', async t => {
  @EmbeddedDocument()
  abstract class Animal {
    public abstract type: string;

    @Field() public name: string;

    public abstract speak(): string;
  }

  @EmbeddedDocument()
  class Cat extends Animal {
    @Field() public type: string = 'cat';

    public speak(): string {
      return 'meow';
    }
  }

  @EmbeddedDocument()
  class Dog extends Animal {
    @Field() public type: string = 'dog';

    public speak(): string {
      return 'woof';
    }
  }

  @Document()
  class User {
    @Field() public _id: ObjectID;
    @Field() public firstName: string;
    @Field() public lastName: string;

    @EmbedOne(({ type }: { type: string }): any => (type === 'cat' ? Cat : Dog))
    public pet: Animal;
  }

  const docWithCat = {
    _id: new ObjectID('507f1f77bcf86cd799439011'),
    firstName: 'Jordy',
    lastName: 'Smith',
    pet: {
      type: 'cat',
      name: 'Whiskers'
    }
  };

  const docWithDog = {
    _id: new ObjectID('507f191e810c19729de860ea'),
    firstName: 'John',
    lastName: 'Florence',
    pet: {
      type: 'dog',
      name: 'Tank'
    }
  };

  const catUser = documentToClass(User, docWithCat);
  const dogUser = documentToClass(User, docWithDog);

  // cat user assertions
  t.true(catUser instanceof User);
  t.is(catUser._id.toHexString(), '507f1f77bcf86cd799439011');
  t.is(catUser.firstName, 'Jordy');
  t.is(catUser.lastName, 'Smith');
  t.true(catUser.pet instanceof Cat);
  t.is(catUser.pet.type, 'cat');
  t.is(catUser.pet.name, 'Whiskers');
  t.is(catUser.pet.speak(), 'meow');

  // dog user assertions
  t.true(dogUser instanceof User);
  t.is(dogUser._id.toHexString(), '507f191e810c19729de860ea');
  t.is(dogUser.firstName, 'John');
  t.is(dogUser.lastName, 'Florence');
  t.true(dogUser.pet instanceof Dog);
  t.is(dogUser.pet.type, 'dog');
  t.is(dogUser.pet.name, 'Tank');
  t.is(dogUser.pet.speak(), 'woof');
});

test('documentToClass() with @EmbedMany() as a discriminator type', async t => {
  @EmbeddedDocument()
  abstract class Animal {
    public abstract type: string;

    @Field() public name: string;

    public abstract speak(): string;
  }

  @EmbeddedDocument()
  class Cat extends Animal {
    @Field() public type: string = 'cat';

    public speak(): string {
      return 'meow';
    }
  }

  @EmbeddedDocument()
  class Dog extends Animal {
    @Field() public type: string = 'dog';

    public speak(): string {
      return 'woof';
    }
  }

  @Document()
  class User {
    @Field() public _id: ObjectID;
    @Field() public firstName: string;
    @Field() public lastName: string;

    @EmbedMany(
      ({ type }: { type: string }): any => (type === 'cat' ? Cat : Dog)
    )
    public pets: Animal[];
  }

  const doc = {
    _id: new ObjectID('507f1f77bcf86cd799439011'),
    firstName: 'Jordy',
    lastName: 'Smith',
    pets: [
      {
        type: 'cat',
        name: 'Whiskers'
      },
      {
        type: 'dog',
        name: 'Tank'
      }
    ]
  };

  const user = documentToClass(User, doc);

  t.true(user instanceof User);
  t.is(user._id.toHexString(), '507f1f77bcf86cd799439011');
  t.is(user.firstName, 'Jordy');
  t.is(user.lastName, 'Smith');
  t.is(user.pets.length, 2);
  t.true(user.pets[0] instanceof Cat);
  t.is(user.pets[0].type, 'cat');
  t.is(user.pets[0].name, 'Whiskers');
  t.is(user.pets[0].speak(), 'meow');
  t.true(user.pets[1] instanceof Dog);
  t.is(user.pets[1].type, 'dog');
  t.is(user.pets[1].name, 'Tank');
  t.is(user.pets[1].speak(), 'woof');
});

test('documentToClass() errors when class passed is not mapped', async t => {
  class User {}

  const error = t.throws(() => {
    documentToClass(User, { foo: 'bar' });
  });

  t.is(
    error.message,
    'Object passed to "documentToClass" is not a valid mapped document.'
  );
});
