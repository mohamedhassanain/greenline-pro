import http from 'http';
import https from 'https';

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', (data) => {
    console.log('Response:', data.toString());
  });
  
  res.on('end', () => {
    console.log('Request completed');
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.on('timeout', () => {
  console.error('Request timed out');
  req.destroy();
});

console.log('Sending test request...');
req.end();
