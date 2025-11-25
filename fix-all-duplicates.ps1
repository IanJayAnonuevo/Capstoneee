# Fix all duplicate imports in one go

$allFiles = Get-ChildItem -Path "c:\xampp\htdocs\Capstoneee\src" -Recurse -Filter "*.jsx" 

foreach ($file in $allFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Check if file has duplicate API_BASE_URL imports
    $matches = [regex]::Matches($content, "import.*API_BASE_URL.*from.*config/api")
    
    if ($matches.Count -gt 1) {
        Write-Host "Fixing $($file.Name)..." -ForegroundColor Yellow
        
        $lines = $content -split "`r`n"
        $seenAPIImport = $false
        $newLines = @()
        
        foreach ($line in $lines) {
            if ($line -match "import.*API_BASE_URL.*from.*config/api") {
                if (-not $seenAPIImport) {
                    $newLines += $line
                    $seenAPIImport = $true
                }
            } else {
                $newLines += $line
            }
        }
        
        $content = $newLines -join "`r`n"
        Set-Content $file.FullName -Value $content -NoNewline
        Write-Host "  Fixed!" -ForegroundColor Green
    }
}

Write-Host "`nAll duplicates removed!" -ForegroundColor Green
