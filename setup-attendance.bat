@echo off
echo ========================================
echo Attendance Monitoring Setup
echo ========================================
echo.

REM Check if MySQL is running
echo Checking if MySQL is running...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MySQL is running
) else (
    echo [ERROR] MySQL is not running. Please start XAMPP MySQL first.
    pause
    exit /b
)

echo.
echo Installing attendance table...
echo.

REM Run the SQL file
cd /d "%~dp0"
"C:\xampp\mysql\bin\mysql.exe" -u root -p kolektrash_db < add_attendance_table.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Attendance table created successfully!
    echo.
    echo Next steps:
    echo 1. Make sure XAMPP Apache is running
    echo 2. Open the application in your browser
    echo 3. Login as foreman (foreman@gmail.com)
    echo 4. Go to Monitor Attendance
    echo 5. Start recording attendance!
) else (
    echo.
    echo [ERROR] Failed to create attendance table.
    echo Please check your MySQL connection and try again.
)

echo.
pause
