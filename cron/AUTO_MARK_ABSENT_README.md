# Auto-Mark Absent System

## Overview
Automatically marks drivers and collectors as **absent** if they fail to time in within the allowed time windows.

---

## Time Windows

### AM Session
- **Allowed Time-In Window**: 5:00 AM - 6:00 AM
- **Auto-Mark Absent Runs At**: 6:05 AM
- **Cron URL**: `https://kolektrash.systemproj.com/cron/auto_mark_absent_am_http.php`

### PM Session
- **Allowed Time-In Window**: 1:00 PM - 2:00 PM
- **Auto-Mark Absent Runs At**: 2:05 PM
- **Cron URL**: `https://kolektrash.systemproj.com/cron/auto_mark_absent_pm_http.php`

---

## How It Works

### 1. **Check Attendance Records**
- Queries all active drivers and collectors (role_id 3 and 4)
- Checks if they have attendance records for today's session

### 2. **Mark Absent**
If a person has **no attendance record** for the session:
- Creates attendance record with `verification_status = 'absent'`
- Sets `time_in` and `time_out` to `NULL`

### 3. **Send Notifications**

#### To Individual Personnel:
```json
{
  "type": "marked_absent",
  "date": "2025-12-01",
  "session": "AM",
  "reason": "Did not time in between 05:00:00 and 06:00:00",
  "message": "You have been marked as absent for 2025-12-01 (AM session) because you did not time in within the allowed window (05:00:00 - 06:00:00)."
}
```

#### To Admin Users:
```json
{
  "type": "auto_absent_summary",
  "date": "2025-12-01",
  "session": "AM",
  "total_marked_absent": 3,
  "personnel": [
    {"user_id": 5, "name": "John Doe", "role": "Driver"},
    {"user_id": 8, "name": "Jane Smith", "role": "Collector"}
  ],
  "message": "3 personnel automatically marked as absent for 2025-12-01 (AM session) due to late/no time-in."
}
```

---

## Files Created

1. **[auto_mark_absent.php](file:///c:/xampp/htdocs/kolektrash/cron/auto_mark_absent.php)**
   - Core logic for marking absent
   - Determines session based on current time
   - Creates attendance records and sends notifications

2. **[auto_mark_absent_am_http.php](file:///c:/xampp/htdocs/kolektrash/cron/auto_mark_absent_am_http.php)**
   - HTTP wrapper for AM session
   - Runs at 6:05 AM
   - Logs to `logs/cron_auto_absent_am.log`

3. **[auto_mark_absent_pm_http.php](file:///c:/xampp/htdocs/kolektrash/cron/auto_mark_absent_pm_http.php)**
   - HTTP wrapper for PM session
   - Runs at 2:05 PM
   - Logs to `logs/cron_auto_absent_pm.log`

---

## Cron Job Setup (cron-job.org)

### AM Session Job
- **URL**: `https://kolektrash.systemproj.com/cron/auto_mark_absent_am_http.php`
- **Schedule**: Every day at **6:05 AM** (Philippine Time)
- **Cron Expression**: `5 6 * * *`

### PM Session Job
- **URL**: `https://kolektrash.systemproj.com/cron/auto_mark_absent_pm_http.php`
- **Schedule**: Every day at **2:05 PM** (Philippine Time)
- **Cron Expression**: `5 14 * * *`

---

## Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Auto-absent marking completed",
  "session": "AM",
  "date": "2025-12-01",
  "cutoff_time": "06:00:00",
  "marked_absent": [
    {"user_id": 5, "name": "John Doe", "role": "Driver"}
  ],
  "total_marked_absent": 1,
  "already_present": 5,
  "already_absent": 0,
  "notifications_sent": true
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Not the right time to run this script. Run at 6:05 AM or 2:05 PM."
}
```

---

## Testing

### Manual Test (AM Session):
```bash
# Visit this URL between 6:00 AM - 12:00 PM
https://kolektrash.systemproj.com/cron/auto_mark_absent.php
```

### Manual Test (PM Session):
```bash
# Visit this URL between 2:00 PM - 6:00 PM
https://kolektrash.systemproj.com/cron/auto_mark_absent.php
```

---

## Database Changes

### Attendance Table
When marking absent, creates record:
```sql
INSERT INTO attendance (
    user_id, 
    attendance_date, 
    session, 
    time_in, 
    time_out, 
    verification_status,
    created_at
) VALUES (
    ?, 
    '2025-12-01', 
    'AM', 
    NULL, 
    NULL, 
    'absent', 
    NOW()
);
```

---

## Integration with Auto-Generate Tasks

The auto-generate system will **skip absent personnel** because:
- `getApprovedPersonnelBySession()` only queries `verification_status = 'verified'`
- Absent personnel have `verification_status = 'absent'`
- They won't be included in task assignments

---

## Upload to Hostinger

Upload these files:
1. `/public_html/cron/auto_mark_absent.php`
2. `/public_html/cron/auto_mark_absent_am_http.php`
3. `/public_html/cron/auto_mark_absent_pm_http.php`

Then set up the cron jobs on cron-job.org with the URLs above.
