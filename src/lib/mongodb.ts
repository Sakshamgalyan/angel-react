import { MongoClient, Db } from 'mongodb';

if (!process.env.DATABASE_URL) {
    throw new Error('Please add your MongoDB URI to .env');
}

const uri = process.env.DATABASE_URL;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
    // eslint-disable-next-line no-var
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable to preserve the client across module reloads
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // In production mode, create a new client
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise;

// Helper function to get the database
export async function getDatabase(dbName: string = 'angel-react'): Promise<Db> {
    const client = await clientPromise;
    return client.db(dbName);
}
