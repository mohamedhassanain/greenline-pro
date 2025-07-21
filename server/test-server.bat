@echo off
echo === Starting Node.js HTTP Server Test ===
echo.
echo Node.js version:
node --version
echo.
echo Current directory: %CD%
echo.

echo Creating test server script...
echo const http = require('http'); > test-server.js
echo const port = 4000; >> test-server.js
echo const server = http.createServer((req, res) => { >> test-server.js
echo   res.writeHead(200, { 'Content-Type': 'text/plain' }); >> test-server.js
echo   res.end('Hello from test server!'); >> test-server.js
echo }); >> test-server.js
echo server.on('error', (err) => { >> test-server.js
echo   console.error('Server error:', err); >> test-server.js
echo   process.exit(1); >> test-server.js
echo }); >> test-server.js
echo server.listen(port, '127.0.0.1', () => { >> test-server.js
echo   console.log('Server running at http://127.0.0.1:' + port); >> test-server.js
echo }); >> test-server.js

echo Starting server...
start "" cmd /k "node test-server.js"

timeout /t 5 >nul

tasklist /FI "IMAGENAME eq node.exe" /FO TABLE
echo.
echo If you see node.exe above, the server is running.
echo Try accessing http://127.0.0.1:4000 in your browser.
echo.
pause
