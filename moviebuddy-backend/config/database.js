import mongoose from 'mongoose';

let isMongoConnected = false;

/**
 * Connects to MongoDB if MONGODB_URI is provided, otherwise falls back to mock data mode.
 * @returns {Promise<boolean>} True if connected to MongoDB, false if running in mock mode.
 */
export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI || mongoURI.trim() === '') {
    console.log('No MONGODB_URI provided. Running in Mock Data mode.');
    isMongoConnected = false;
    return false;
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully.');
    isMongoConnected = true;
    return true;
  } catch (error) {
    console.warn(`MongoDB connection failed (${error.message}). Falling back to Mock Data mode.`);
    isMongoConnected = false;
    return false;
  }
};

/**
 * Returns whether the application is currently using MongoDB or mock data.
 * @returns {boolean} Connection state.
 */
export const getDbStatus = () => isMongoConnected;
