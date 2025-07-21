import express from 'express';
import http from 'http';

async function startTestServer(port) {
  return new Promise((resolve, reject) => {
    const app = express();
    
    // Simple route for testing
    app.get('/', (req, res) => {
      res.json({ message: 'Test server is running', timestamp: new Date().toISOString() });
    });
    
    const server = http.createServer(app);
    
    server.on('error', (error) => {
      console.error('Test server error:', error);
      reject(error);
    });
    
    server.listen(port, '0.0.0.0', () => {
      console.log(`Test server running on port ${port}`);
      resolve(server);
    });
  });
}

// Start the test server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = parseInt(process.env.PORT || '4000', 10);
  startTestServer(port).catch(error => {
    console.error('Failed to start test server:', error);
    process.exit(1);
  });
}

export { startTestServer };
