import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { MongoClient } from 'mongodb';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

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
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    return null;
  }
}

const DEFAULT_PROFILE = {
  userId: 'default-user',
  name: 'Nurul',
  email: 'nurul@example.com',
  role: 'Team Member',
  location: 'Jakarta, Indonesia',
  bio: 'Designs smooth workspace experiences with attention to detail.',
  phone: '+62 812 3456 7890',
};

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.use(express.json());

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

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

  server.get('/api/profile', async (req, res) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.json({ success: true, profile: DEFAULT_PROFILE });
      }

      const collection = db.collection<any>('profiles');
      let profile = await collection.findOne({ userId: DEFAULT_PROFILE.userId });

      if (!profile) {
        await collection.insertOne(DEFAULT_PROFILE);
        profile = DEFAULT_PROFILE;
      }

      return res.json({ success: true, profile });
    } catch (error) {
      console.error('Error fetching profile:', error);
      return res.json({ success: true, profile: DEFAULT_PROFILE });
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
        console.warn('MongoDB unavailable; returning profile without saving.');
        return res.json({ success: true, profile: profileData });
      }

      const collection = db.collection<any>('profiles');
      const result = (await collection.findOneAndUpdate(
        { userId: DEFAULT_PROFILE.userId },
        { $set: profileData },
        { upsert: true, returnDocument: 'after' }
      )) as { value: any } | null;

      return res.json({ success: true, profile: result?.value ?? profileData });
    } catch (error) {
      console.error('Error saving profile:', error);
      return res.json({ success: true, profile: profileData });
    }
  });

  // Serve static files from /browser
  server.get('**', express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
  }));

  // All regular routes use the Angular engine
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
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
