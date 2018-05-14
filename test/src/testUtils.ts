import { Collection, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { mapper, TypedConstructor } from '../../src';

const mongoServer = new MongoMemoryServer();
let cache: MongoClient;

export async function createClient(): Promise<MongoClient> {
  const uri = await mongoServer.getConnectionString();

  if (!cache) {
    // @ts-ignore
    cache = await MongoClient.connect(uri, { useNewUrlParser: true });
  }

  return cache;
}

export async function getCollection<T>(
  mappedClass: TypedConstructor<T>,
  name: string
): Promise<Collection> {
  const client = await createClient();

  const db = client.db(`test_${name}`);

  // @ts-ignore
  return db.collection(name, {
    // @ts-ignore
    ...mapper(mappedClass)
  });
}
