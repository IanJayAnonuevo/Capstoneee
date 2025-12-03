$body = @{
    start_date = "2025-11-29"
    end_date = "2025-11-29"
    session = "PM"
    overwrite = $false
    cron_token = "kolektrash_cron_2024"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost/kolektrash/backend/api/auto_generate_all.php" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

Write-Host "Status Code: $($response.StatusCode)"
Write-Host "Response:"
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
