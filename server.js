import dotenv from 'dotenv';
import app from './src/app.js';
import connectDB from './src/config/db.js';

// Load environment variables from .env file
dotenv.config();

// Determine server port from environment variable, defaulting to 5000
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize MongoDB connection using Mongoose
connectDB();

// Start listening for incoming network requests
const server = app.listen(PORT, () => {
  console.log(`[Server] War Economic Impact API running in [${NODE_ENV}] mode on port ${PORT}`);
});

// ==========================================
// Process Error Event Listeners
// ==========================================

// Handle synchronous runtime errors that were not caught inside try-catch blocks
process.on('uncaughtException', (err) => {
  console.error('[Process Error] Uncaught Exception! Shutting down application...');
  console.error(err.name, err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});

// Handle asynchronous promise rejections that were not caught
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process Error] Unhandled Rejection! Closing server and shutting down...');
  console.error('Unhandled Promise:', promise, 'Reason:', reason);
  
  // Gracefully close server listening port before terminating the process
  server.close(() => {
    process.exit(1);
  });
});
