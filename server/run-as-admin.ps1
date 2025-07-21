# PowerShell script to run Node.js server test as Administrator
param(
    [string]$TestScript = "admin-test.js"
)

Write-Host "=== Node.js Administrator Test Runner ===" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if ($isAdmin) {
    Write-Host "✅ Running as Administrator" -ForegroundColor Green
    Write-Host "Current user: $env:USERNAME"
    Write-Host "Current directory: $(Get-Location)"
    Write-Host ""
    
    # Check if Node.js is available
    try {
        $nodeVersion = node --version
        Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Node.js not found in PATH" -ForegroundColor Red
        Write-Host "Please ensure Node.js is installed and in your PATH"
        exit 1
    }
    
    # Check if test script exists
    if (Test-Path $TestScript) {
        Write-Host "📄 Test script found: $TestScript" -ForegroundColor Green
        Write-Host ""
        Write-Host "🚀 Starting Node.js server test..." -ForegroundColor Yellow
        Write-Host "=" * 50
        
        # Run the Node.js test
        try {
            node $TestScript
        } catch {
            Write-Host "❌ Error running test script: $_" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Test script not found: $TestScript" -ForegroundColor Red
        Write-Host "Please ensure the script exists in the current directory"
        exit 1
    }
} else {
    Write-Host "❌ Not running as Administrator" -ForegroundColor Red
    Write-Host ""
    Write-Host "To run this test as Administrator:" -ForegroundColor Yellow
    Write-Host "1. Right-click on PowerShell and select 'Run as Administrator'" -ForegroundColor White
    Write-Host "2. Navigate to this directory: cd '$PWD'" -ForegroundColor White
    Write-Host "3. Run: .\run-as-admin.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Or run this command to restart as Administrator:" -ForegroundColor Yellow
    Write-Host "Start-Process PowerShell -Verb RunAs -ArgumentList '-NoExit', '-Command', 'cd \"$PWD\"; .\run-as-admin.ps1'" -ForegroundColor Cyan
    
    # Offer to restart as Administrator
    $response = Read-Host "`nWould you like to restart PowerShell as Administrator? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Start-Process PowerShell -Verb RunAs -ArgumentList '-NoExit', '-Command', "cd `"$PWD`"; .\run-as-admin.ps1"
    }
}
