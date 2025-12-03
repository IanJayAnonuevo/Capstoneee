$body = @{
    start_date = "2025-11-29"
    end_date = "2025-11-29"
    session = "PM"
    overwrite = $true
    cron_token = "kolektrash_cron_2024"
} | ConvertTo-Json

Write-Host "Testing cron API with detailed output..."
Write-Host "Request body: $body"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost/kolektrash/backend/api/auto_generate_all.php" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing

    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host ""
    Write-Host "Response:"
    $jsonResponse = $response.Content | ConvertFrom-Json
    $jsonResponse | ConvertTo-Json -Depth 10
    
    Write-Host ""
    Write-Host "=== TASKS RESULT ==="
    $jsonResponse.tasks | ConvertTo-Json -Depth 5
    
    Write-Host ""
    Write-Host "=== ROUTES RESULT ==="
    $jsonResponse.routes | ConvertTo-Json -Depth 5
    
} catch {
    Write-Host "Error: $_"
    Write-Host $_.Exception.Message
}
