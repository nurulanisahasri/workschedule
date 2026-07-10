import test from "node:test";

require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env["MONGODB_URI"];
let client: { connect: () => any; close: () => any; db: (arg0: string) => any; };

beforeAll(async () => {
    if (!uri) {
        throw new Error('MONGODB_URI environment variable is not set. Please check your .env file.');
    }
    console.log('Connecting to MongoDB...');
    client = new MongoClient(uri);
    await client.connect();
    console.log('✓ Successfully connected to MongoDB');
});

afterAll(async () => {
    if (client) {
        await client.close();
        console.log('✓ MongoDB connection closed');
    }
});

test('MongoDB connection', async () => {
    const db = client.db('workschedule');
    const collections = await db.listCollections().toArray();
    expect(collections).toBeDefined();
    console.log('✓ MongoDB test passed');
});