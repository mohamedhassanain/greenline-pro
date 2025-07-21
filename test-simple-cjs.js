const express = require('express');
const http = require('http');

function startTestServer(port) {
  return new Promise((resolve, reject) => {
    const app = express();
    
    // Simple route for testing
    app.get('/', (req, res) => {
      res.json({ message: 'Test CJS server is running', timestamp: new Date().toISOString() });
    });
    
    const server = http.createServer(app);
    
    server.on('error', (error) => {
      console.error('Test server error:', error);
      reject(error);
    });
    
    server.listen(port, '0.0.0.0', () => {
      console.log(`Test CJS server running on port ${port}`);
      resolve(server);
    });
  });
}

// Start the test server if this file is run directly
if (require.main === module) {
  const port = parseInt(process.env.PORT || '4000', 10);
  startTestServer(port).catch(error => {
    console.error('Failed to start test server:', error);
    process.exit(1);
  });
}

module.exports = { startTestServer };
