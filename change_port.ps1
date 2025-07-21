$envPath = "c:\Users\hassa\Desktop\Nouveau dossier\project\server\.env"
$content = Get-Content -Path $envPath -Raw
$newContent = $content -replace 'PORT=3004', 'PORT=3005'
Set-Content -Path $envPath -Value $newContent
Write-Host "Port changé de 3004 à 3005 dans le fichier .env"
