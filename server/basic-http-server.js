// Basic HTTP server using Node.js built-in http module
import { createServer } from 'http';

console.log('=== Starting basic HTTP server ===');
console.log('Node.js version:', process.version);
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || 'not set');

const port = process.env.PORT || 4000;

const server = createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    message: 'Basic HTTP server is running',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    env: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: port
    }
  }));
});

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`\n=== Server running on http://localhost:${port} ===`);
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
