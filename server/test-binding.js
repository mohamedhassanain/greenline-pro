// Test server binding with detailed error reporting
import { createServer } from 'http';
import { createServer as createNetServer } from 'net';

console.log('=== Testing Server Binding ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform, process.arch);

// Test 1: Basic TCP server binding
console.log('\n--- Test 1: TCP Server Binding ---');
const tcpServer = createNetServer();

tcpServer.on('error', (error) => {
  console.error('TCP Server error:', error.code, error.message);
  console.error('Full error:', error);
});

tcpServer.on('listening', () => {
  const address = tcpServer.address();
  console.log('TCP Server successfully bound to:', address);
  tcpServer.close();
  
  // Test 2: HTTP server binding
  console.log('\n--- Test 2: HTTP Server Binding ---');
  testHttpServer();
});

tcpServer.listen(4000, '127.0.0.1');

function testHttpServer() {
  const httpServer = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Test server response');
  });

  httpServer.on('error', (error) => {
    console.error('HTTP Server error:', error.code, error.message);
    console.error('Full error:', error);
    process.exit(1);
  });

  httpServer.on('listening', () => {
    const address = httpServer.address();
    console.log('HTTP Server successfully bound to:', address);
    console.log('Server is listening and ready to accept connections');
    
    // Keep server running for a few seconds
    setTimeout(() => {
      console.log('Closing HTTP server...');
      httpServer.close(() => {
        console.log('HTTP server closed successfully');
        console.log('\n=== All binding tests completed successfully ===');
      });
    }, 3000);
  });

  console.log('Attempting to bind HTTP server to 127.0.0.1:4001...');
  httpServer.listen(4001, '127.0.0.1');
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, shutting down...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
