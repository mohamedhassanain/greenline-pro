# Test HTTP server with detailed output
$ErrorActionPreference = "Stop"

Write-Host "=== Starting HTTP Server Test ===" -ForegroundColor Cyan
Write-Host "Current directory: $(Get-Location)"
Write-Host "Node.js version: $(node --version)"
Write-Host "NPM version: $(npm --version)"

# Create a simple HTTP server script
$serverScript = @"
import http from 'http';
const port = 4000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from test server!');
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

server.listen(port, '127.0.0.1', () => {
  console.log('Server running at http://127.0.0.1:' + port);
});
"@

$tempFile = "$env:TEMP\test-http-server.js"
$serverScript | Out-File -FilePath $tempFile -Encoding utf8

Write-Host "`n=== Starting test server..." -ForegroundColor Yellow
$serverProcess = Start-Process -FilePath "node" -ArgumentList $tempFile -PassThru -NoNewWindow -RedirectStandardError "$pwd\server-error.log"

# Give the server a moment to start
Start-Sleep -Seconds 2

# Check if the server is running
if ($serverProcess.HasExited) {
    $errorContent = Get-Content "$pwd\server-error.log" -Raw -ErrorAction SilentlyContinue
    Write-Host "`n=== Server failed to start ===" -ForegroundColor Red
    Write-Host "Exit code: $($serverProcess.ExitCode)"
    Write-Host "Error output: $errorContent"
} else {
    Write-Host "`n=== Server started successfully ===" -ForegroundColor Green
    Write-Host "Process ID: $($serverProcess.Id)"
    
    # Try to access the server
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:4000" -UseBasicParsing -ErrorAction Stop
        Write-Host "`n=== Server response ===" -ForegroundColor Green
        Write-Host "Status code: $($response.StatusCode)"
        Write-Host "Response: $($response.Content.Trim())"
    } catch {
        Write-Host "`n=== Failed to access server ===" -ForegroundColor Red
        Write-Host "Error: $_"
    }
    
    # Stop the server
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    Remove-Item "$pwd\server-error.log" -ErrorAction SilentlyContinue
}

Write-Host "`n=== Test completed ===`n" -ForegroundColor Cyan
