# Fix duplicate imports caused by the first script

$files = @(
    "src\components\resident\ResidentSettings.jsx",
    "src\components\barangayhead\Feedback.jsx"
)

foreach ($file in $files) {
    $filePath = Join-Path "c:\xampp\htdocs\kolektrash" $file
    
    if (Test-Path $filePath) {
        Write-Host "Fixing duplicates in $file..." -ForegroundColor Yellow
        
        $content = Get-Content $filePath -Raw
        
        # Remove duplicate API_BASE_URL imports - keep only the first one
        $lines = $content -split "`r`n"
        $seenAPIImport = $false
        $newLines = @()
        
        foreach ($line in $lines) {
            if ($line -match "import.*API_BASE_URL.*from.*config/api") {
                if (-not $seenAPIImport) {
                    $newLines += $line
                    $seenAPIImport = $true
                }
                # Skip duplicate lines
            } else {
                $newLines += $line
            }
        }
        
        $content = $newLines -join "`r`n"
        Set-Content $filePath -Value $content -NoNewline
        Write-Host "  Fixed!" -ForegroundColor Green
    }
}

Write-Host "`nDone!" -ForegroundColor Green
