# PowerShell script to replace hardcoded localhost URLs

$files = @(
    "src\components\garbagecollector\GarbageCollectorHome.jsx",
    "src\components\garbagecollector\MyAssignments.jsx",
    "src\components\resident\Feedback.jsx",
    "src\components\resident\ResidentSettings.jsx",
    "src\components\resident\ResidentIEC.jsx",
    "src\components\barangayhead\Feedback.jsx",
    "src\components\barangayhead\IEC.jsx"
)

foreach ($file in $files) {
    $filePath = Join-Path "c:\xampp\htdocs\kolektrash" $file
    
    if (Test-Path $filePath) {
        Write-Host "Fixing $file..." -ForegroundColor Yellow
        
        $content = Get-Content $filePath -Raw
        
        # Replace localhost URLs
        $content = $content -replace 'http://localhost/kolektrash/backend/api', '${API_BASE_URL}'
        $content = $content -replace "http://localhost:5173/materials/", "/materials/"
        
        # Add import if ${API_BASE_URL} is used and import doesn't exist
        if (($content -match '\$\{API_BASE_URL\}') -and ($content -notmatch "import.*API_BASE_URL")) {
            $content = $content -replace "(import.*?;)", "`$1`r`nimport { API_BASE_URL } from '../../config/api';"
        }
        
        Set-Content $filePath -Value $content -NoNewline
        Write-Host "  Done!" -ForegroundColor Green
    } else {
        Write-Host "  Not found: $filePath" -ForegroundColor Red
    }
}

Write-Host "`nAll files processed!" -ForegroundColor Green
