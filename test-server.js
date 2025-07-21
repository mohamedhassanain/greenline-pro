import http from 'http';

const port = 3002;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Test server is running!');});

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

server.listen(port, () => {
  console.log(`Test server running on http://localhost:${port}`);
});
