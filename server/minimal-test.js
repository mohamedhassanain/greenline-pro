// Minimal test to check basic Node.js functionality
console.log('=== Starting minimal test ===');
console.log('Node.js version:', process.version);

// Test 1: Basic console output
console.log('Test 1: Console output works');

// Test 2: File system access
import { writeFileSync, unlinkSync } from 'fs';
try {
  const testFile = 'minimal-test-file.txt';
  writeFileSync(testFile, 'test');
  console.log('Test 2: File system write access works');
  unlinkSync(testFile);
  console.log('Test 3: File system delete access works');
} catch (error) {
  console.error('File system test failed:', error.message);
}

// Test 4: HTTP server
console.log('\nTest 4: Attempting to create HTTP server...');
import { createServer } from 'http';
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from minimal test server!');});

server.on('error', (error) => {
  console.error('HTTP server error:', error.message);  
  process.exit(1);
});

server.listen(4000, '127.0.0.1', () => {
  console.log('HTTP server is running on http://127.0.0.1:4000');
  console.log('Press Ctrl+C to stop the server');
});

// Keep the process running
process.on('SIGINT', () => {
  console.log('\nStopping server...');
  server.close();
  process.exit(0);
});
