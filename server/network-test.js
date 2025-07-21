// Simple network test script
import { createServer } from 'net';
import { createWriteStream } from 'fs';
import { join } from 'path';

const logFile = createWriteStream('network-test.log', { flags: 'a' });
const log = (...args) => {
  const msg = `[${new Date().toISOString()}] ${args.join(' ')}`;
  console.log(msg);
  logFile.write(msg + '\n');
};

// Test basic HTTP server
async function testHttpServer(port) {
  log(`\n=== Testing HTTP server on port ${port} ===`);
  
  try {
    const { createServer } = await import('http');
    const server = createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Hello from test server!');
    });
    
    server.on('error', (err) => {
      log(`HTTP server error on port ${port}:`, err.code);
    });
    
    server.listen(port, '0.0.0.0', () => {
      log(`HTTP server listening on port ${port}`);
      // Keep the server running for a while
      setTimeout(() => {
        server.close();
        log(`HTTP server on port ${port} closed`);
      }, 5000);
    });
  } catch (error) {
    log('HTTP server creation failed:', error.message);
  }
}

// Test raw TCP server
async function testTcpServer(port) {
  log(`\n=== Testing TCP server on port ${port} ===`);
  
  try {
    const server = createServer((socket) => {
      socket.write('Echo server\r\n');
      socket.pipe(socket);
    });
    
    server.on('error', (err) => {
      log(`TCP server error on port ${port}:`, err.code);
    });
    
    server.listen(port, '0.0.0.0', () => {
      log(`TCP server listening on port ${port}`);
      // Keep the server running for a while
      setTimeout(() => {
        server.close();
        log(`TCP server on port ${port} closed`);
      }, 5000);
    });
  } catch (error) {
    log('TCP server creation failed:', error.message);
  }
}

// Main function
async function runTests() {
  log('=== Starting network tests ===');
  log(`Node.js version: ${process.version}`);
  log(`Platform: ${process.platform} ${process.arch}`);
  log(`Current directory: ${process.cwd()}`);
  
  // Test HTTP server
  await testHttpServer(4000);
  
  // Test TCP server
  await testTcpServer(4001);
  
  log('\n=== Network tests completed ===');
  logFile.end();
}

// Run tests
runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
