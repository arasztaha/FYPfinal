import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let mongoServer: MongoMemoryServer;

const connectDB = async () => {
  try {
    // Use MongoDB memory server in development
    let mongoURI: string;

    if (process.env.NODE_ENV === 'production' && process.env.MONGO_URI) {
      // Use the production MongoDB URI
      mongoURI = process.env.MONGO_URI;
    } else {
      // Use MongoDB Memory Server for development/testing
      mongoServer = await MongoMemoryServer.create();
      mongoURI = mongoServer.getUri();
      console.log('Using MongoDB Memory Server');
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log("MongoDB URI:", mongoURI); // Ensure it’s stable across reloads
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
};

// Disconnect function for cleanup
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error(`Error disconnecting from MongoDB: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export default connectDB;
