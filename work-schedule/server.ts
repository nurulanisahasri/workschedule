import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { join } from 'node:path';

const DEFAULT_PROFILE = {
  userId: 'default-user',
  name: 'Nurul',
  email: 'nurul@example.com',
  role: 'Team Member',
  location: 'Jakarta, Indonesia',
  bio: 'Designs smooth workspace experiences with attention to detail.',
  phone: '+62 812 3456 7890',
};

let currentProfile = { ...DEFAULT_PROFILE };
const inMemoryBookings: any[] = [];
const inMemoryProfiles: any[] = [{ ...DEFAULT_PROFILE }];

const mongoUri = process.env['MONGODB_URI'] || 'mongodb://127.0.0.1:27017/workschedule';
const mongoClient = new MongoClient(mongoUri, {
  serverSelectionTimeoutMS: 3000,
});
let dbConnected = false;

async function getDb() {
  if (dbConnected) {
    return mongoClient.db();
  }

  try {
    await mongoClient.connect();
    dbConnected = true;
    console.log('Connected to MongoDB:', mongoUri);
    return mongoClient.db();
  } catch (error: any) {
    console.warn('MongoDB connection failed:', error.message);
    console.warn('Using in-memory storage for bookings and profiles');
    return null;
  }
}

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();

  server.use(express.json());

  // API endpoint for frontend requests
  server.post('/api/applyCard', (req, res) => {
    const { userId } = req.body;

    console.log(`Received card application request for userId=${userId}`);

    return res.json({
      success: true,
      userId,
      message: `Card application received for userId=${userId}`,
    });
  });

  server.post('/api/bookWorkspace', async (req, res) => {
    const bookingData = req.body;

    console.log('Received booking request:', bookingData);

    if (!bookingData || !bookingData.workspaceId || !bookingData.date || !bookingData.time || !bookingData.endTime) {
      console.error('Missing required fields:', { workspaceId: bookingData?.workspaceId, date: bookingData?.date, time: bookingData?.time, endTime: bookingData?.endTime });
      return res.status(400).json({
        success: false,
        message: 'Missing required booking fields. Please provide workspaceId, date, time, and endTime.',
      });
    }

    try {
      const db = await getDb();
      if (db) {
        const collection = db.collection<any>('bookings');
        const bookingWithTimestamp = {
          ...bookingData,
          _id: new ObjectId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const result = await collection.insertOne(bookingWithTimestamp);
        console.log('Booking saved to MongoDB:', result.insertedId);
        return res.json({ success: true, booking: bookingWithTimestamp, bookingId: result.insertedId });
      } else {
        console.warn('MongoDB not connected, storing in memory');
        const booking = {
          ...bookingData,
          _id: `mem-${Date.now()}`,
          createdAt: new Date(),
        };
        inMemoryBookings.push(booking);
        return res.json({ success: true, booking, bookingId: booking._id });
      }
    } catch (error: any) {
      console.error('Error saving booking:', error);
      return res.status(500).json({
        success: false,
        message: `Failed to book workspace: ${error.message || 'Unknown error'}`,
        error: error.message,
      });
    }
  });

  server.get('/api/profile', async (req, res) => {
    try {
      const db = await getDb();
      if (!db) {
        // Return current profile from in-memory storage
        return res.json({ success: true, profile: currentProfile });
      }

      const collection = db.collection<any>('profiles');
      const profile = await collection.findOne({ userId: DEFAULT_PROFILE.userId });

      if (profile) {
        currentProfile = profile;
      }

      return res.json({ success: true, profile: currentProfile });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      return res.status(500).json({ success: false, message: `Failed to load profile: ${error.message}` });
    }
  });

  server.post('/api/profile', async (req, res) => {
    const profileData = {
      ...req.body,
      userId: DEFAULT_PROFILE.userId,
    };

    try {
      const db = await getDb();
      if (!db) {
        currentProfile = profileData;
        return res.json({ success: true, profile: currentProfile });
      }

      const collection = db.collection<any>('profiles');
      const result = await collection.findOneAndUpdate(
        { userId: DEFAULT_PROFILE.userId },
        { $set: profileData },
        { upsert: true, returnDocument: 'after' }
      );

      currentProfile = result.value ?? profileData;
      return res.json({ success: true, profile: currentProfile });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      return res.status(500).json({ success: false, message: `Failed to save profile: ${error.message}` });
    }
  });

  server.get('/api/bookings', async (req, res) => {
    try {
      const db = await getDb();
      if (db) {
        const collection = db.collection<any>('bookings');
        const bookings = await collection.find().toArray();
        return res.json({ success: true, bookings });
      }

      return res.json({ success: true, bookings: inMemoryBookings });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return res.status(500).json({ success: false, message: 'Failed to load bookings.' });
    }
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
