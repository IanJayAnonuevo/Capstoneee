# 🗑️ Attendance Deletion API Guide

This guide explains how to delete attendance records using API URLs for testing purposes.

---

## 🔐 Authentication

All deletion endpoints require a password parameter for security:
```
?password=reset123
```

---

## 📍 API Endpoints

### 1. Delete Attendance by Specific Date

**Endpoint:**
```
/backend/api/delete_attendance_by_date.php
```

**Usage Examples:**

#### Delete ALL attendance for December 5, 2025
```
https://your-domain.com/backend/api/delete_attendance_by_date.php?date=2025-12-05&password=reset123
```

**Response:**
```json
{
  "success": true,
  "message": "Deleted 6 attendance records for 2025-12-05 (all sessions)",
  "date": "2025-12-05",
  "session": "all",
  "current_time": "2025-12-04 23:45:00",
  "deleted_count": 6,
  "deleted_records": [
    {
      "attendance_id": 123,
      "user_id": 5,
      "full_name": "John Doe",
      "role": "truck_driver",
      "session": "AM",
      "verification_status": "approved",
      "time_in": "2025-12-05 06:30:00"
    },
    ...
  ]
}
```

---

#### Delete ONLY AM session attendance
```
https://your-domain.com/backend/api/delete_attendance_by_date.php?date=2025-12-05&session=AM&password=reset123
```

**Response:**
```json
{
  "success": true,
  "message": "Deleted 3 attendance records for 2025-12-05 (AM session)",
  "date": "2025-12-05",
  "session": "AM",
  "deleted_count": 3,
  "deleted_records": [...]
}
```

---

#### Delete ONLY PM session attendance
```
https://your-domain.com/backend/api/delete_attendance_by_date.php?date=2025-12-05&session=PM&password=reset123
```

**Response:**
```json
{
  "success": true,
  "message": "Deleted 3 attendance records for 2025-12-05 (PM session)",
  "date": "2025-12-05",
  "session": "PM",
  "deleted_count": 3,
  "deleted_records": [...]
}
```

---

#### Delete TODAY's attendance (auto-detect current date)
```
https://your-domain.com/backend/api/delete_attendance_by_date.php?password=reset123
```

**Response:**
```json
{
  "success": true,
  "message": "Deleted 4 attendance records for 2025-12-04 (all sessions)",
  "date": "2025-12-04",
  "session": "all",
  "deleted_count": 4,
  "deleted_records": [...]
}
```

---

### 2. Reset Today's Attendance (Legacy)

**Endpoint:**
```
/backend/reset_today_attendance.php
```

**Usage:**
```
https://your-domain.com/backend/reset_today_attendance.php?password=reset123
```

**Note:** This only deletes TODAY's attendance. Use the new API for more flexibility.

---

## 🎯 Common Use Cases

### Testing Workflow: Clean Slate

When you want to test the full transaction from scratch:

1. **Delete existing attendance:**
   ```
   https://your-domain.com/backend/api/delete_attendance_by_date.php?date=2025-12-05&password=reset123
   ```

2. **Generate fresh tasks:**
   ```
   https://your-domain.com/cron/auto_generate_all.php?date=2025-12-05
   ```

3. **Create new attendance:**
   ```
   https://your-domain.com/backend/test_attendance_bypass.php?date=2025-12-05&session=AM
   ```

---

### Testing AM Session Only

1. **Delete only AM attendance:**
   ```
   https://your-domain.com/backend/api/delete_attendance_by_date.php?date=2025-12-05&session=AM&password=reset123
   ```

2. **Recreate AM attendance:**
   ```
   https://your-domain.com/backend/test_attendance_bypass.php?date=2025-12-05&session=AM
   ```

---

### Testing PM Session Only

1. **Delete only PM attendance:**
   ```
   https://your-domain.com/backend/api/delete_attendance_by_date.php?date=2025-12-05&session=PM&password=reset123
   ```

2. **Recreate PM attendance:**
   ```
   https://your-domain.com/backend/test_attendance_bypass.php?date=2025-12-05&session=PM
   ```

---

### Clean Up After Testing

Delete all test data for a specific date:

```
https://your-domain.com/backend/api/delete_attendance_by_date.php?date=2025-12-05&password=reset123
```

---

## 🔍 Verification

After deletion, verify the records are gone:

### Check in Frontend
1. Login as **Foreman**
2. Navigate to **Attendance Monitoring**
3. Select the date
4. Should show no attendance records (or only remaining session if you deleted specific session)

### Check in Database (phpMyAdmin)
```sql
SELECT * FROM attendance 
WHERE attendance_date = '2025-12-05'
ORDER BY session, created_at;
```

Should return 0 rows (or only remaining session records).

---

## ⚠️ Important Notes

### Security
- **Password protected:** All endpoints require `?password=reset123`
- **Production:** Change the password in production or remove these endpoints
- **Access control:** These are testing endpoints, not for production use

### Data Integrity
- **Cascading effects:** Deleting attendance doesn't delete tasks or routes
- **Personnel status:** After deletion, personnel will appear as "not timed in"
- **Task assignments:** Task assignments remain intact
- **Reversible:** You can recreate attendance using the bypass API

### Best Practices
- **Delete before recreating:** Always delete old attendance before creating new test data
- **Session-specific:** Use session parameter when testing specific sessions
- **Verify deletion:** Always check the response to confirm deletion count
- **Clean up:** Delete test data after testing is complete

---

## 🚨 Error Handling

### Unauthorized Error
```json
{
  "success": false,
  "message": "Unauthorized. Use: ?password=reset123"
}
```
**Solution:** Add `?password=reset123` to the URL

---

### Invalid Date Format
```json
{
  "success": false,
  "message": "Invalid date format. Use YYYY-MM-DD"
}
```
**Solution:** Use correct date format: `2025-12-05`

---

### Invalid Session
```json
{
  "success": false,
  "message": "Invalid session. Use AM or PM"
}
```
**Solution:** Use `AM` or `PM` (case-insensitive)

---

## 📊 Response Fields

| Field | Description |
|-------|-------------|
| `success` | Boolean indicating if deletion was successful |
| `message` | Human-readable message |
| `date` | The date for which attendance was deleted |
| `session` | The session deleted (`AM`, `PM`, or `all`) |
| `current_time` | Server timestamp when deletion occurred |
| `deleted_count` | Number of records deleted |
| `deleted_records` | Array of deleted records with details |

---

## 🔄 Complete Testing Cycle

Here's a complete cycle for testing:

```bash
# 1. Clean up old data
https://your-domain.com/backend/api/delete_attendance_by_date.php?date=2025-12-05&password=reset123

# 2. Generate tasks
https://your-domain.com/cron/auto_generate_all.php?date=2025-12-05

# 3. Create attendance
https://your-domain.com/backend/test_attendance_bypass.php?date=2025-12-05&session=AM

# 4. Verify routes
https://your-domain.com/backend/check_routes.php?date=2025-12-05

# 5. Test in frontend (manual)
# - Login as different roles
# - Execute tasks
# - Verify completion

# 6. Clean up after testing
https://your-domain.com/backend/api/delete_attendance_by_date.php?date=2025-12-05&password=reset123
```

---

## 💡 Pro Tips

1. **Always check the response:** The API shows you what was deleted before deletion
2. **Use session parameter:** When testing specific sessions to preserve other session data
3. **Bookmark URLs:** Save frequently used URLs for quick access
4. **Check deleted_count:** Verify the expected number of records were deleted
5. **Review deleted_records:** See exactly what was removed

---

## 🎓 Quick Reference

| Action | URL |
|--------|-----|
| Delete specific date (all) | `?date=2025-12-05&password=reset123` |
| Delete specific date (AM) | `?date=2025-12-05&session=AM&password=reset123` |
| Delete specific date (PM) | `?date=2025-12-05&session=PM&password=reset123` |
| Delete today | `?password=reset123` |

**Base URL:** `https://your-domain.com/backend/api/delete_attendance_by_date.php`

---

## 📝 Local Testing

For local testing (XAMPP), use:
```
http://localhost/kolektrash/backend/api/delete_attendance_by_date.php?date=2025-12-05&password=reset123
```

For Hostinger production, use:
```
https://your-domain.com/backend/api/delete_attendance_by_date.php?date=2025-12-05&password=reset123
```
