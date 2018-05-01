<h1 align="center" style="border-bottom: none;">🔗 type-mongo-mapper</h1>
<h3 align="center">A <a href="https://www.typescriptlang.org/docs/handbook/decorators.html">@decorator</a> based <a href="https://www.mongodb.com/">MongoDB</a> document to ES6 class mapper.</h3>
<p align="center">
    <a href="https://travis-ci.org/j/type-mongo-mapper">
        <img alt="Travis" src="https://img.shields.io/travis/j/type-mongo-mapper/preview.svg">
    </a>
    <a href="https://codecov.io/gh/j/type-mongo-mapper/branch/preview">
        <img alt="Travis" src="https://img.shields.io/codecov/c/github/j/type-mongo-mapper/preview.svg">
    </a>
</p>

**type-mongo-mapper** makes it easy to map javascript classes to MongoDB documents and back using @decorators.

## Install

```sh
yarn add type-mongo-mapper
```

## Usage

### Quickstart

```ts
import { Document, Field, classToDocument, documentToClass } from 'type-mongo-mapper';

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

// Document to User

const user = documentToClass(User, await collection.findOne({ /* ... */ }));

// Documents to Users

const users = await collection.find({ /* ... */ }).map((doc) => documentToClass(User, doc)).toArray();


// User to document

const user = new User();
user.firstName = 'John';
user.lastName = 'Doe';

await collection.insertOne(classToDocument(user));

```