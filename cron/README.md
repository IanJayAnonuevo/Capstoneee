# Setup Instructions for Auto-Generate Cron Job

## Overview
This cron job automatically generates tasks and routes for the next 7 days.
It runs daily at 11:00 PM to prepare schedules for the upcoming week.

## Files
- `auto_generate_daily.ps1` - Main cron script
- `logs/cron_auto_generate.log` - Log file (auto-created)

## Setup Instructions

### Step 1: Test the Script Manually

Open PowerShell and run:
```powershell
cd C:\xampp\htdocs\kolektrash\cron
.\auto_generate_daily.ps1
```

Check the log file:
```powershell
Get-Content C:\xampp\htdocs\kolektrash\logs\cron_auto_generate.log -Tail 20
```

### Step 2: Schedule with Windows Task Scheduler

1. **Open Task Scheduler**:
   - Press `Win + R`
   - Type `taskschd.msc`
   - Press Enter

2. **Create New Task**:
   - Click "Create Task" (not "Create Basic Task")
   - Name: `KolekTrash Auto-Generate`
   - Description: `Automatically generates tasks and routes for the next 7 days`
   - Check "Run whether user is logged on or not"
   - Check "Run with highest privileges"

3. **Triggers Tab**:
   - Click "New..."
   - Begin the task: `On a schedule`
   - Settings: `Daily`
   - Start: `11:00:00 PM`
   - Recur every: `1 days`
   - Click "OK"

4. **Actions Tab**:
   - Click "New..."
   - Action: `Start a program`
   - Program/script: `powershell.exe`
   - Add arguments: `-ExecutionPolicy Bypass -File "C:\xampp\htdocs\kolektrash\cron\auto_generate_daily.ps1"`
   - Start in: `C:\xampp\htdocs\kolektrash\cron`
   - Click "OK"

5. **Conditions Tab**:
   - Uncheck "Start the task only if the computer is on AC power"
   - Check "Wake the computer to run this task" (optional)

6. **Settings Tab**:
   - Check "Allow task to be run on demand"
   - Check "Run task as soon as possible after a scheduled start is missed"
   - If the task fails, restart every: `1 minute`
   - Attempt to restart up to: `3 times`

7. **Click "OK"** to save the task

### Step 3: Test the Scheduled Task

Right-click the task and select "Run" to test it immediately.

Check the log file to verify it ran successfully:
```powershell
Get-Content C:\xampp\htdocs\kolektrash\logs\cron_auto_generate.log -Tail 20
```

## Configuration

Edit `auto_generate_daily.ps1` to customize:

- **API URL**: Change if your server is not localhost
- **Cron Token**: Change if you update the security token
- **Date Range**: Currently generates for next 7 days (change `AddDays(7)`)
- **Overwrite**: Set to `$true` if you want to replace existing tasks

## Monitoring

View recent logs:
```powershell
Get-Content C:\xampp\htdocs\kolektrash\logs\cron_auto_generate.log -Tail 50
```

View today's logs only:
```powershell
$today = Get-Date -Format "yyyy-MM-dd"
Get-Content C:\xampp\htdocs\kolektrash\logs\cron_auto_generate.log | Select-String $today
```

## Troubleshooting

### Script doesn't run
- Check Task Scheduler history
- Verify PowerShell execution policy: `Get-ExecutionPolicy`
- Run manually to see errors

### API returns errors
- Check if XAMPP/Apache is running
- Verify the API URL is correct
- Check the cron token matches

### No tasks generated
- Verify predefined schedules exist in the database
- Check if the date range has active schedules
- Review the log file for details

## Manual Execution

To manually generate for specific dates:
```powershell
cd C:\xampp\htdocs\kolektrash\cron
.\auto_generate_daily.ps1
```

Or use the HTML test page:
```
http://localhost/kolektrash/test_auto_generate.html
```
