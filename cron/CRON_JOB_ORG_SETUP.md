# Cron-Job.org Setup Guide for KolekTrash

## Overview

This guide explains how to set up automated task and route generation using cron-job.org external service.

## Cron Jobs Schedule

| Time | Job Name | Endpoint | Purpose |
|------|----------|----------|---------|
| 6:00 AM | Morning Generation | `morning_generate_http.php` | Generate AM session tasks for today |
| 2:00 PM | Afternoon Generation | `afternoon_generate_http.php` | Generate PM session tasks for today |

## Setup Instructions

### 1. Create cron-job.org Account

1. Go to https://cron-job.org
2. Sign up for a free account
3. Verify your email

### 2. Add Morning Generation Job (6:00 AM)

1. Click **"Create cronjob"**
2. Fill in the details:
   - **Title**: `KolekTrash - Morning Generation (6 AM)`
   - **Address (URL)**: `https://kolektrash.systemproj.com/cron/morning_generate_http.php`
   - **Schedule**:
     - Every day
     - At 6:00 AM
     - Timezone: **Asia/Manila (GMT+8)**
   - **Notifications**:
     - ✅ Enable failure notifications
     - Email: your email
3. Click **"Create cronjob"**

### 3. Add Afternoon Generation Job (2:00 PM)

1. Click **"Create cronjob"**
2. Fill in the details:
   - **Title**: `KolekTrash - Afternoon Generation (2 PM)`
   - **Address (URL)**: `https://kolektrash.systemproj.com/cron/afternoon_generate_http.php`
   - **Schedule**:
     - Every day
     - At 2:00 PM (14:00)
     - Timezone: **Asia/Manila (GMT+8)**
   - **Notifications**:
     - ✅ Enable failure notifications
     - Email: your email
3. Click **"Create cronjob"**

## Testing

### Test Endpoints Manually

1. **Morning Generation**:
   ```
   https://kolektrash.systemproj.com/cron/morning_generate_http.php
   ```
   Expected: JSON response with `success: true`

2. **Afternoon Generation**:
   ```
   https://kolektrash.systemproj.com/cron/afternoon_generate_http.php
   ```
   Expected: JSON response with `success: true`

3. **Status Dashboard**:
   ```
   https://kolektrash.systemproj.com/cron/cron_status.php
   ```
   Shows all cron job logs and statistics

### Test on cron-job.org

1. Go to your cron-job.org dashboard
2. Find the job you want to test
3. Click the **"▶ Run now"** button
4. Check the execution history for success/failure

## Monitoring

### View Execution History

On cron-job.org:
1. Click on a cron job
2. Go to **"History"** tab
3. View recent executions with:
   - Timestamp
   - HTTP status code
   - Response time
   - Success/failure status

### View Logs

Access the status dashboard:
```
https://kolektrash.systemproj.com/cron/cron_status.php
```

This shows:
- Today's task count
- Today's route count
- Recent log entries for each cron job
- Quick test buttons

### Check Database

Run these SQL queries to verify:

```sql
-- Check today's tasks
SELECT COUNT(*) as task_count 
FROM collection_team ct 
LEFT JOIN collection_schedule cs ON ct.schedule_id = cs.schedule_id 
WHERE cs.scheduled_date = CURDATE();

-- Check today's routes
SELECT COUNT(*) as route_count 
FROM daily_route 
WHERE date = CURDATE();
```

## Troubleshooting

### Cron job fails with HTTP 500

**Possible causes:**
- API endpoint is down
- Database connection issue
- Invalid cron token

**Solution:**
1. Check the status dashboard for error logs
2. Test the endpoint manually in browser
3. Verify XAMPP/Apache is running

### No tasks generated

**Possible causes:**
- No predefined schedules for today
- Overwrite is disabled and tasks already exist
- Database connection issue

**Solution:**
1. Check if schedules exist: `SELECT * FROM collection_schedule WHERE scheduled_date = CURDATE()`
2. Try with `overwrite=true` parameter
3. Check logs for specific error messages

### Wrong timezone

**Possible causes:**
- cron-job.org timezone not set to Asia/Manila
- PHP timezone not set correctly

**Solution:**
1. Verify cron-job.org timezone is **Asia/Manila (GMT+8)**
2. Check PHP files have `date_default_timezone_set('Asia/Manila')`

## Advanced Configuration

### Generate for Specific Date

Use the specific date endpoint:
```
https://kolektrash.systemproj.com/cron/generate_specific_date.php?date=2025-12-02
```

Parameters:
- `date` (required): YYYY-MM-DD format
- `session` (optional): AM or PM
- `overwrite` (optional): true or false

### Custom Schedule

To generate for multiple days ahead, create additional cron jobs with the specific date endpoint.

Example for generating tomorrow's tasks:
```
https://kolektrash.systemproj.com/cron/generate_specific_date.php?date=<?= date('Y-m-d', strtotime('+1 day')) ?>
```

## Security Notes

1. **Cron Token**: The API requires a valid cron token (`kolektrash_cron_2024`)
2. **HTTPS**: Always use HTTPS for production
3. **Rate Limiting**: cron-job.org has rate limits on free tier
4. **Monitoring**: Enable email notifications for failures

## Support

If you encounter issues:
1. Check the status dashboard: `https://kolektrash.systemproj.com/cron/cron_status.php`
2. Review logs in `logs/cron_morning.log` and `logs/cron_afternoon.log`
3. Test endpoints manually in browser
4. Check cron-job.org execution history
