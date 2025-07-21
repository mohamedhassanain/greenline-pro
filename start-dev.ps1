# Script PowerShell pour démarrer le serveur avec des variables d'environnement

# Définir les variables d'environnement
$env:NODE_ENV = "development"
$env:PORT = "3001"
$env:SUPABASE_URL = "https://yzetnnefjkykehbaoocf.supabase.co"
$env:SUPABASE_ANON_KEY ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZXRubmVmamt5a2VoYmFvb2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Nzc4NzAsImV4cCI6MjA2NzU1Mzg3MH0.2lcT7264msX29Ot3_xZUx2VsAvn2aiwt8_3l6yImhBg"
$env:SUPABASE_SERVICE_ROLE_KEY ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZXRubmVmamt5a2VoYmFvb2NmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTk3Nzg3MCwiZXhwIjoyMDY3NTUzODcwfQ.v6rmAvqJWWIc_jNiRw3M0x9pSyMIXybMI4ln2p4HWRw"
$env:JWT_SECRET = "9OpZTnOu0UuAbNE/hznRCsn2YKxk7mpfipStDBH8oAvWtc8zK95o8uim0WM4zv6rptRbpp/JHVgA8EwBmfvuLg=="

# Afficher les variables définies
Write-Host "=== Variables d'environnement définies ==="
Get-ChildItem env: | Where-Object { $_.Name -match "NODE|SUPABASE|JWT" } | Format-Table -AutoSize

# Démarrer le serveur
Write-Host "`nDémarrage du serveur..."
node server/server.js
