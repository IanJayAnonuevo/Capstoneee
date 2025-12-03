# Test auto_generate_all.php endpoint
# Usage: .\test_auto_generate.ps1

$url = "http://localhost/kolektrash/backend/api/auto_generate_all.php"

$body = @{
    start_date = "2025-12-01"
    end_date = "2025-12-01"
    overwrite = $false
    cron_token = "kolektrash_cron_2024"
} | ConvertTo-Json

Write-Host "Testing auto_generate_all.php..." -ForegroundColor Cyan
Write-Host "URL: $url" -ForegroundColor Gray
Write-Host "Body: $body" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "✓ Success!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "✗ Error!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Response Body:" -ForegroundColor Yellow
        Write-Host $responseBody
    }
}
