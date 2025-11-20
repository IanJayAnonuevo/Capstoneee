# Attendance Monitoring Setup Script
# PowerShell version with better error handling

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Attendance Monitoring Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is running
Write-Host "Checking if MySQL is running..." -ForegroundColor Yellow
$mysqlProcess = Get-Process mysqld -ErrorAction SilentlyContinue

if ($mysqlProcess) {
    Write-Host "[OK] MySQL is running" -ForegroundColor Green
} else {
    Write-Host "[ERROR] MySQL is not running. Please start XAMPP MySQL first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

Write-Host ""
Write-Host "Installing attendance table..." -ForegroundColor Yellow
Write-Host ""

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sqlFile = Join-Path $scriptDir "add_attendance_table.sql"

# Check if SQL file exists
if (-not (Test-Path $sqlFile)) {
    Write-Host "[ERROR] SQL file not found: $sqlFile" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

# MySQL executable path
$mysqlExe = "C:\xampp\mysql\bin\mysql.exe"

if (-not (Test-Path $mysqlExe)) {
    Write-Host "[ERROR] MySQL executable not found: $mysqlExe" -ForegroundColor Red
    Write-Host "Please check your XAMPP installation path." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

# Run the SQL file
try {
    $output = & $mysqlExe -u root kolektrash_db -e "source $sqlFile" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[SUCCESS] Attendance table created successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Make sure XAMPP Apache is running" -ForegroundColor White
        Write-Host "2. Open the application in your browser" -ForegroundColor White
        Write-Host "3. Login as foreman (foreman@gmail.com)" -ForegroundColor White
        Write-Host "4. Go to Monitor Attendance" -ForegroundColor White
        Write-Host "5. Start recording attendance!" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "[ERROR] Failed to create attendance table." -ForegroundColor Red
        Write-Host "Error output: $output" -ForegroundColor Red
        Write-Host "Please check your MySQL connection and try again." -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "[ERROR] An error occurred: $_" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"
