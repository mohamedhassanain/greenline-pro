// Test script to check environment variables
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from project root
const envPath = path.resolve(__dirname, '.env');
console.log('Loading .env from:', envPath);

try {
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    console.error('Error loading .env file:', result.error);
  } else {
    console.log('Successfully loaded .env file');
  }
  
  console.log('\nEnvironment Variables:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '***' + process.env.SUPABASE_URL.slice(-10) : 'undefined');
  console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '***' + process.env.SUPABASE_ANON_KEY.slice(-4) : 'undefined');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '***' + process.env.SUPABASE_SERVICE_ROLE_KEY.slice(-4) : 'undefined');
  
} catch (error) {
  console.error('Unexpected error:', error);
}
