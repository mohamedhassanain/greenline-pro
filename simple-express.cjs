const express = require('express');
const http = require('http');
const path = require('path');

// Create Express app
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple route
app.get('/', (req, res) => {
  res.json({
    message: 'Simple Express Server is running',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    env: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: port
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(port, '0.0.0.0', () => {
  console.log(`\n=== Simple Express Server ===`);
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Node.js ${process.version} on ${process.platform}`);
  console.log('Press Ctrl+C to stop the server\n');
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server has been stopped');
    process.exit(0);
  });
});
