<h1 align="center" style="border-bottom: none;">🔗 type-mongo-mapper</h1>
<h3 align="center">A <a href="https://www.typescriptlang.org/docs/handbook/decorators.html">@decorator</a> based <a href="https://www.mongodb.com/">MongoDB</a> document to ES6 class mapper.</h3>
<p align="center">
    <a href="https://travis-ci.org/j/type-mongo-mapper">
        <img alt="travis" src="https://img.shields.io/travis/j/type-mongo-mapper/master.svg">
    </a>
    <a href="https://codecov.io/gh/j/type-mongo-mapper/branch/master">
        <img alt="codecov" src="https://img.shields.io/codecov/c/github/j/type-mongo-mapper/master.svg">
    </a>
</p>

**type-mongo-mapper** makes it easy to map javascript classes to MongoDB documents and back using @decorators.

## Install

```sh
yarn add type-mongo-mapper
```

## Usage

If you want to take advantage of an upcoming feature in mongodb, you must use `mongodb@3.1.0` and higher.  Otherwise, you can just
use the "map" and "unmap" methods manually when dealing with plain documents. See <a href="https://github.com/mongodb/node-mongodb-native/commit/d03335e246e93635e0ba6716cd5edd351a274f62">this commit</a>

### Quickstart

```ts
import { Document, Field, mapper } from 'type-mongo-mapper';

@Document()
class User {
  @Field()
  public _id: ObjectID;

  @Field()
  public firstName: string;

  @Field()
  public lastName: string;

  get id(): string {
    return this._id.toHexString();
  }
}

const { map, unmap } = mapper(User);

// pass "map" & "umap" options to collection
const usersCollection = db.collection('users', { map, unmap });

// Document to User

const user = await usersCollection.findOne({ /* ... */ }) // user is an instanceof User

// Documents to Users

const users = await collection.find({ /* ... */ }); // each item in cursor will be a User


// Save a User.

const user = new User();
user.firstName = 'John';
user.lastName = 'Doe';

await collection.insertOne(user);

```