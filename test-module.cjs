// Test script to verify CommonJS module system
console.log('=== CommonJS Module System Test ===');
console.log('Node.js version:', process.version);
console.log('__filename:', __filename);
console.log('__dirname:', __dirname);
console.log('require:', typeof require);

// Test built-in modules
const path = require('path');
console.log('Path module loaded:', path.basename(__filename));

// Test file system access
const fs = require('fs');
console.log('Current directory files:', fs.readdirSync(__dirname).join(', '));

// Test environment variables
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || 'not set');

console.log('=== Test completed successfully ===');
