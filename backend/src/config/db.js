import mongoose from 'mongoose';

let memoryServerInstance = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log(`[Database] Connected to MongoDB at: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.error(`[Database] Failed to connect to MONGODB_URI: ${err.message}`);
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`MongoDB connection failed in production. Please check your MONGODB_URI environment variable in your deployment dashboard: ${err.message}`);
      }
    }
  }

  // Development Fallback
  if (process.env.NODE_ENV !== 'production') {
    try {
      console.log('[Database] Trying local MongoDB connection at mongodb://127.0.0.1:27017/dueledger ...');
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/dueledger', {
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`[Database] Connected to local MongoDB at: ${conn.connection.host}`);
      return;
    } catch (localErr) {
      console.warn(`[Database] Local MongoDB not running (${localErr.message}). Booting embedded in-memory MongoDB engine...`);
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create();
        const memoryUri = memoryServerInstance.getUri();
        const conn = await mongoose.connect(memoryUri);
        console.log(`[Database] Connected to Embedded MongoDB at: ${memoryUri}`);
        return;
      } catch (memErr) {
        console.error('[Database] Embedded MongoDB failed to start:', memErr);
      }
    }
  } else {
    throw new Error('Missing MONGODB_URI environment variable in production. Please provide a valid MongoDB Atlas connection string (e.g., mongodb+srv://username:password@cluster.mongodb.net/dueledger) in your deployment environment settings.');
  }
};

export const closeDB = async () => {
  await mongoose.connection.close();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
};
