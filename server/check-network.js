// Test basic network connectivity
import { get as httpsGet } from 'https';
import { get as httpGet } from 'http';

console.log('=== Testing Network Connectivity ===');
console.log('Node.js version:', process.version);

// Test HTTP request to a public API
console.log('\nTesting HTTP request to example.com...');

try {
  const req = httpGet('http://example.com', (res) => {
    console.log(`Response status: ${res.statusCode}`);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response received (first 200 chars):');
      console.log(data.substring(0, 200) + '...');
      console.log('\n=== Network test completed successfully ===');
    });
  });
  
  req.on('error', (error) => {
    console.error('Request error:', error);
    process.exit(1);
  });
  
} catch (error) {
  console.error('Error during request:', error);
  process.exit(1);
}
