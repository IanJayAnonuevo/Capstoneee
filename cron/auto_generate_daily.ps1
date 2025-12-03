# Auto-Generate Tasks and Routes Cron Job
# Schedule this to run daily at 11:00 PM

$apiUrl = "http://localhost/kolektrash/backend/api/auto_generate_all.php"
$cronToken = "kolektrash_cron_2024"
$logFile = "C:\xampp\htdocs\kolektrash\logs\cron_auto_generate.log"

# Calculate dates
$tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
$endDate = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")

# Ensure log directory exists
$logDir = Split-Path $logFile -Parent
if (!(Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# Log function
function Write-Log {
    param($Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage
    Add-Content -Path $logFile -Value $logMessage
}

Write-Log "========================================="
Write-Log "Starting auto-generation cron job"
Write-Log "Generating from $tomorrow to $endDate"

# Prepare request body
$body = @{
    start_date = $tomorrow
    end_date = $endDate
    overwrite = $false
    cron_token = $cronToken
} | ConvertTo-Json

# Make API request
Write-Log "Sending request to API..."

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-Log "SUCCESS: Tasks and routes generated successfully"
        Write-Log "Tasks generated: $($response.tasks.total_generated)"
        
        foreach ($routeResult in $response.routes) {
            Write-Log "Routes for $($routeResult.date): $($routeResult.routes_generated) route(s)"
        }
    }
    else {
        Write-Log "ERROR: $($response.message)"
    }
}
catch {
    Write-Log "EXCEPTION: $($_.Exception.Message)"
    exit 1
}

Write-Log "Cron job completed"
Write-Log "========================================="
