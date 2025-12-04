# 🚀 Quick API Test URLs for Hostinger

Replace `your-domain.com` with your actual Hostinger domain.

---

## 📅 Step 1: Generate Tasks & Routes

**URL:**
```
https://your-domain.com/cron/auto_generate_all.php?date=2025-12-05
```

**What it does:**
- Creates tasks for December 5, 2025
- Generates routes with collection points
- Assigns personnel (truck driver + collectors)
- Assigns trucks

**Expected:** JSON response with `success: true` and task/route counts

---

## 👥 Step 2: Create Attendance (Bypass Time Restriction)

**URL:**
```
https://your-domain.com/backend/test_attendance_bypass.php?date=2025-12-05&session=AM
```

**What it does:**
- Creates attendance records for all assigned personnel
- Bypasses 6-7 AM time restriction
- Marks everyone as present

**Expected:** JSON response with attendance records created

---

## ❌ Step 3: Mark Absent Personnel (Optional)

**URL:**
```
https://your-domain.com/cron/auto_mark_absent.php
```

**What it does:**
- Marks personnel as absent if they didn't time in
- Runs automatically at 7:00 AM and 1:00 PM

**Expected:** JSON response with absent count

---

## 🔍 Step 4: Verify Routes Generated

**URL:**
```
https://your-domain.com/backend/check_routes.php?date=2025-12-05
```

**What it does:**
- Shows all routes for the specified date
- Displays route details and assignments

**Expected:** JSON with route information

---

## 👷 Step 5: Check Personnel Assignments

**URL:**
```
https://your-domain.com/backend/check_personnel.php?date=2025-12-05
```

**What it does:**
- Shows all personnel assigned to tasks
- Displays their roles and assignments

**Expected:** JSON with personnel assignment details

---

## 📋 Step 6: Check Cron Logs

**URL:**
```
https://your-domain.com/backend/check_cron_logs.php
```

**What it does:**
- Shows recent cron job execution logs
- Displays any errors or warnings

**Expected:** Log entries from cron jobs

---

## 🧪 Testing Workflow

### Quick Test (5 minutes)

1. **Create schedule in admin panel** (manual)
   - Date: December 5, 2025
   - Session: AM
   - Cluster: 1C-PB

2. **Generate tasks** (paste in browser):
   ```
   https://your-domain.com/cron/auto_generate_all.php?date=2025-12-05
   ```

3. **Create attendance** (paste in browser):
   ```
   https://your-domain.com/backend/test_attendance_bypass.php?date=2025-12-05&session=AM
   ```

4. **Verify in Foreman dashboard** (manual):
   - Login as Foreman
   - Check "Today's Tasks"
   - Verify personnel and routes

5. **Execute task as Truck Driver** (manual):
   - Login as Truck Driver
   - View task
   - Complete route stops
   - Mark task as done

6. **Verify completion** (manual):
   - Check "Past Tasks"
   - Verify in Admin dashboard

---

## 🔧 Troubleshooting URLs

### Reset Today's Attendance
```
https://your-domain.com/backend/reset_today_attendance.php?password=reset123
```

### Delete Attendance by Date (NEW!)

**Delete all attendance for a specific date:**
```
https://your-domain.com/backend/api/delete_attendance_by_date.php?date=2025-12-05&password=reset123
```

**Delete only AM session attendance:**
```
https://your-domain.com/backend/api/delete_attendance_by_date.php?date=2025-12-05&session=AM&password=reset123
```

**Delete only PM session attendance:**
```
https://your-domain.com/backend/api/delete_attendance_by_date.php?date=2025-12-05&session=PM&password=reset123
```

**Delete today's attendance (no date specified):**
```
https://your-domain.com/backend/api/delete_attendance_by_date.php?password=reset123
```

### Check Database Tables
```
https://your-domain.com/backend/check_tables.php
```

### Verify Attendance Schema
```
https://your-domain.com/backend/check_attendance_schema.php
```

### Check Verification Status
```
https://your-domain.com/backend/check_verification.php
```

---

## 📝 Notes

- **Time-sensitive:** Some operations are time-restricted (6-7 AM for AM session)
- **Use bypass APIs** for testing outside time windows
- **Check logs** if something doesn't work
- **Verify in database** using phpMyAdmin if needed

---

## ⚡ One-Click Test Sequence

Copy and paste these URLs one by one in your browser:

1. Generate tasks:
   ```
   https://your-domain.com/cron/auto_generate_all.php?date=2025-12-05
   ```

2. Create attendance:
   ```
   https://your-domain.com/backend/test_attendance_bypass.php?date=2025-12-05&session=AM
   ```

3. Verify routes:
   ```
   https://your-domain.com/backend/check_routes.php?date=2025-12-05
   ```

4. Check personnel:
   ```
   https://your-domain.com/backend/check_personnel.php?date=2025-12-05
   ```

5. View logs:
   ```
   https://your-domain.com/backend/check_cron_logs.php
   ```

---

## 🎯 Success Indicators

After running the APIs, you should see:

- ✅ **Step 1:** `tasks_created > 0` and `routes_created > 0`
- ✅ **Step 2:** `records_created > 0` (usually 3: 1 driver + 2 collectors)
- ✅ **Step 3:** Routes with collection points listed
- ✅ **Step 4:** Personnel assigned with names and roles
- ✅ **Step 5:** No errors in logs

Then verify in the frontend:
- ✅ Foreman sees tasks in "Today's Tasks"
- ✅ Truck Driver sees assigned task
- ✅ Garbage Collectors see their assignment
- ✅ Route stops are listed
- ✅ Can complete route stops
- ✅ Can mark task as done
