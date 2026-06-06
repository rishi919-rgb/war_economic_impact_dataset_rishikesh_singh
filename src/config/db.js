import mongoose from 'mongoose';

/**
 * Establishes a connection to MongoDB using the MONGO_URI environment variable.
 * Logs connection status and exits the process with a failure code (1) if the connection fails,
 * as database connectivity is critical for the application's runtime.
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in the environment variables.');
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    // Exit process with failure in production-grade app when DB is unreachable
    process.exit(1);
  }
};

export default connectDB;
