// Test server binding with Administrator privileges
import { createServer } from 'http';

console.log('=== Testing Server Binding as Administrator ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform, process.arch);
console.log('Current user:', process.env.USERNAME);
console.log('Current directory:', process.cwd());

// Test HTTP server binding
const server = createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  res.writeHead(200, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify({
    status: 'success',
    message: 'Server is running with Administrator privileges!',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version
  }));
});

server.on('error', (error) => {
  console.error('❌ Server error:', error.code, error.message);
  console.error('Full error details:', error);
  process.exit(1);
});

server.on('listening', () => {
  const address = server.address();
  console.log('✅ SUCCESS: HTTP Server bound successfully!');
  console.log(`🚀 Server running at: http://localhost:${address.port}`);
  console.log(`📡 Address details:`, address);
  console.log('\n🔥 Server is ready to accept connections!');
  console.log('📝 Try accessing the server in your browser or with curl');
  console.log('🛑 Press Ctrl+C to stop the server\n');
});

const port = 4000;
console.log(`\n🔄 Attempting to bind HTTP server to localhost:${port}...`);
server.listen(port, 'localhost');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received shutdown signal...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

// Keep the process alive and show status every 5 seconds
let statusInterval = setInterval(() => {
  if (server.listening) {
    console.log(`📊 Server status: RUNNING on port ${server.address().port}`);
  }
}, 5000);
