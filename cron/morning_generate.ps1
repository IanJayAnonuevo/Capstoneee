# Morning Auto-Generate (6:00 AM)
# Generates tasks and routes for TODAY's morning shift

$apiUrl = "http://localhost/kolektrash/backend/api/auto_generate_all.php"
$cronToken = "kolektrash_cron_2024"
$logFile = "C:\xampp\htdocs\kolektrash\logs\cron_morning.log"

# Calculate dates
$today = (Get-Date).ToString("yyyy-MM-dd")

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
Write-Log "MORNING GENERATION (6:00 AM)"
Write-Log "Generating for: $today"

# Prepare request body - AM session only
$body = @{
    start_date = $today
    end_date = $today
    overwrite = $false
    session = "AM"
    cron_token = $cronToken
} | ConvertTo-Json

# Make API request
Write-Log "Sending request to API..."

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-Log "SUCCESS: Morning tasks and routes generated"
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

Write-Log "Morning generation completed"
Write-Log "========================================="
