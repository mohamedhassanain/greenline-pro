import http from 'http';

const port = 4000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!');
});

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}/`);
});

console.log('Server starting...');
