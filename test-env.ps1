# Script PowerShell pour afficher le contenu brut du fichier .env
$envPath = ".\.env"
$bytes = [System.IO.File]::ReadAllBytes($envPath)

Write-Host "=== Contenu brut du fichier .env (${envPath}) ==="
Write-Host "Taille du fichier: $($bytes.Length) octets"
Write-Host "Début du fichier (100 premiers octets):"
$bytes[0..99] | ForEach-Object { [char]$_ + " " + $_ + " | " }

# Vérifier la présence d'un BOM
$hasBOM = ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
Write-Host "`nContient un BOM (Byte Order Mark): $hasBOM"

# Afficher le contenu comme texte
Write-Host "`n=== Contenu texte ==="
$content = [System.IO.File]::ReadAllText($envPath, [System.Text.Encoding]::UTF8)
$content

# Vérifier les caractères de fin de ligne
$hasCR = $content -match "`r"
$hasLF = $content -match "`n"
$hasCRLF = $content -match "`r`n"
Write-Host "`n=== Caractères de fin de ligne ==="
Write-Host "Contient CR (\r): $hasCR"
Write-Host "Contient LF (\n): $hasLF"
Write-Host "Contient CRLF (\r\n): $hasCRLF"

# Afficher les variables d'environnement actuelles
Write-Host "`n=== Variables d'environnement actuelles ==="
Get-ChildItem env: | Where-Object { $_.Name -match "NODE|SUPABASE|JWT" } | Format-Table -AutoSize
