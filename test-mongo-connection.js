const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

async function testConnection() {
  const client = new MongoClient(uri);
  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('✓ Connected to MongoDB successfully!');
    
    const db = client.db('workschedule');
    const collections = await db.listCollections().toArray();
    console.log('✓ Collections:', collections.map(c => c.name));
    
    return true;
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    return false;
  } finally {
    await client.close();
  }
}

testConnection().then(success => process.exit(success ? 0 : 1));
