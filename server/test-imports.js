// Test script to verify module imports
console.log('=== Testing module imports ===');
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());

// Test basic imports
try {
  console.log('Testing import express...');
  const express = await import('express');
  console.log('Express imported successfully:', !!express);
  
  console.log('Testing import cors...');
  const cors = await import('cors');
  console.log('CORS imported successfully:', !!cors);
  
  console.log('Testing import http...');
  const http = await import('http');
  console.log('HTTP imported successfully:', !!http);
  
  console.log('Testing import path...');
  const path = await import('path');
  console.log('Path imported successfully:', !!path);
  
  console.log('Testing import supabase...');
  const { supabase } = await import('./config/supabase.js');
  console.log('Supabase imported successfully:', !!supabase);
  
  console.log('=== All imports successful ===');
} catch (error) {
  console.error('Import error:', error);
  process.exit(1);
}
