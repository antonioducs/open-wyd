import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wyd';

// Global variable to cache the connection
let cachedConnection: typeof mongoose | null = null;

export const connectToDatabase = async () => {
  if (cachedConnection) {
    console.log('Using existing MongoDB connection');
    return cachedConnection;
  }

  console.log('Creating new MongoDB connection');
  try {
    const connection = await mongoose.connect(MONGODB_URI, {
      // Mongoose 6+ defaults are good, but explicit for clarity if needed
      // bufferCommands: false, // useful for serverless if you want to fail fast
    });
    cachedConnection = connection;
    return connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

// Redis Client
import Redis from 'ioredis';

let cachedRedis: Redis | null = null;

export const getRedisClient = () => {
  if (cachedRedis) {
    return cachedRedis;
  }

  const REDIS_URI = process.env.REDIS_URI || 'redis://localhost:6379';
  console.log('Creating new Redis connection');

  cachedRedis = new Redis(REDIS_URI);

  cachedRedis.on('error', (err) => {
    console.error('Redis error:', err);
  });

  return cachedRedis;
};

// Simple Schema Example
const PlayerSchema = new mongoose.Schema({
  name: String,
  level: Number,
  updatedAt: Date,
});

export const PlayerModel = mongoose.models.Player || mongoose.model('Player', PlayerSchema);

export * from './audit-log';
export * from './session-manager';
export * from './models/Account';
export * from './repositories/AccountRepository';
