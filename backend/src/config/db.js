import mongoose from 'mongoose';

let memoryServerInstance = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dueledger';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick fallback if local MongoDB service is not started
    });
    console.log(`[Database] Connected to MongoDB at: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`[Database] Standard MongoDB connection failed (${err.message}). Initializing embedded in-memory MongoDB engine for seamless development/testing...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create();
      const memoryUri = memoryServerInstance.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database] Connected to Embedded MongoDB Server at: ${memoryUri}`);
    } catch (memErr) {
      console.error('[Database] Failed to initialize embedded MongoDB engine:', memErr);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  await mongoose.connection.close();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
};
