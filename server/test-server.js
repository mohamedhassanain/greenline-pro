const http = require('http'); 
const port = 4000; 
const server = http.createServer((req, res) =
  res.writeHead(200, { 'Content-Type': 'text/plain' }); 
  res.end('Hello from test server!'); 
}); 
server.on('error', (err) =
  console.error('Server error:', err); 
  process.exit(1); 
}); 
server.listen(port, '127.0.0.1', () =
  console.log('Server running at http://127.0.0.1:' + port); 
}); 
