// Simple server to test basic functionality
import express from 'express';
import { createServer } from 'http';

console.log('=== Starting simple server ===');
console.log('Node.js version:', process.version);
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || 'not set');

const app = express();
const port = process.env.PORT || 4000;

// Basic middleware
app.use(express.json());

// Simple route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Simple server is running',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    env: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: port
    }
  });
});

// Create HTTP server
const server = createServer(app);

// Start server
server.listen(port, '0.0.0.0', () => {
  console.log(`\n=== Server running on http://localhost:${port} ===`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('=== Ready to handle requests ===\n');
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server has been stopped');
    process.exit(0);
  });
});

console.log('Server initialization complete');
