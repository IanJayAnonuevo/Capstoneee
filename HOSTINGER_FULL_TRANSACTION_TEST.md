# Full Transaction Testing on Hostinger (Production)

This guide will help you test the complete transaction flow on your Hostinger production server by manually triggering API endpoints through the browser.

---

## 🌐 Production URLs

**Frontend:** `https://your-domain.com` (replace with your actual domain)  
**Backend API:** `https://your-domain.com/backend/`  
**Cron Jobs:** `https://your-domain.com/cron/`

---

## 📋 Test Scenario

**Test Date:** December 5, 2025  
**Session:** AM (Morning)  
**Cluster:** 1C-PB (or any available cluster)

---

## ✅ Step-by-Step Testing Process

### Step 1: Create Schedule (Admin)

1. **Login to Production:**
   - Go to `https://your-domain.com`
   - Login as **Admin**

2. **Create Schedule:**
   - Navigate to **Schedule Management** → **Manage Schedule**
   - Add new schedule:
     - **Date:** December 5, 2025
     - **Session:** AM
     - **Cluster:** 1C-PB
   - Click **Add Schedule**

3. **Verify:**
   - ✅ Schedule appears in calendar
   - ✅ Success notification shown

---

### Step 2: Generate Tasks & Routes (Manual Trigger)

**Trigger the cron job by accessing this URL in your browser:**

```
https://your-domain.com/cron/auto_generate_all.php?date=2025-12-05
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Tasks and routes generated successfully",
  "date": "2025-12-05",
  "tasks_created": 2,
  "routes_created": 2,
  "details": {
    "AM": {
      "tasks": 1,
      "routes": 1,
      "personnel_assigned": 3
    },
    "PM": {
      "tasks": 1,
      "routes": 1,
      "personnel_assigned": 3
    }
  }
}
```

**What to check:**
- ✅ `success: true`
- ✅ Tasks created count > 0
- ✅ Routes created count > 0
- ✅ Personnel assigned

---

### Step 3: Verify Generated Tasks (Admin/Foreman)

1. **Login as Foreman:**
   - Go to `https://your-domain.com`
   - Login as **Foreman**

2. **Check Today's Tasks:**
   - Navigate to **Today's Tasks**
   - Verify tasks for December 5, AM session appear
   - Check assigned personnel and truck

3. **Verify Details:**
   - ✅ Truck driver assigned
   - ✅ Garbage collectors assigned (2 collectors)
   - ✅ Truck assigned
   - ✅ Route stops listed

---

### Step 4: Personnel Time-In (Morning 6:00-7:00 AM)

> **Note:** Time-in is only available between 6:00 AM - 7:00 AM for AM session

#### Option A: Manual Time-In (If within time window)

1. **Truck Driver:**
   - Login as **Truck Driver**
   - Click **Time In** button on dashboard
   - Confirm

2. **Garbage Collectors:**
   - Login as **Garbage Collector 1**
   - Click **Time In**
   - Repeat for **Garbage Collector 2**

#### Option B: Bypass Time-In (For Testing Outside Time Window)

**Use the attendance bypass API:**

```
https://your-domain.com/backend/test_attendance_bypass.php?date=2025-12-05&session=AM
```

This will automatically create attendance records for all assigned personnel.

**Expected Response:**
```json
{
  "success": true,
  "message": "Attendance records created for testing",
  "records_created": 3,
  "personnel": [
    {"user_id": 5, "name": "John Doe", "role": "truck_driver"},
    {"user_id": 8, "name": "Jane Smith", "role": "garbage_collector"},
    {"user_id": 9, "name": "Bob Johnson", "role": "garbage_collector"}
  ]
}
```

---

### Step 5: Verify Attendance (Foreman)

1. **Login as Foreman**
2. **Navigate to Attendance Monitoring**
3. **Check for:**
   - ✅ Green dots for all personnel who timed in
   - ✅ No red dots (absent)
   - ✅ Attendance count matches assigned personnel

---

### Step 6: Execute Task (Truck Driver)

1. **Login as Truck Driver:**
   - Go to `https://your-domain.com`
   - Login with truck driver credentials

2. **View Today's Tasks:**
   - Navigate to **Today's Tasks**
   - Click on the AM session task

3. **Complete Route Stops:**
   - For each collection point:
     - Click **Mark as Completed**
     - Upload proof photo (optional)
     - Confirm completion

4. **Monitor Progress:**
   - ✅ Progress bar updates
   - ✅ Completed stops show checkmark
   - ✅ Map updates (if enabled)

---

### Step 7: Complete Task (Truck Driver)

1. **After all stops are completed:**
   - Click **Mark Task as Done** button
   - Confirm completion

2. **Verify:**
   - ✅ Task moves to **Past Tasks**
   - ✅ Task status = "completed"
   - ✅ Completion timestamp recorded

---

### Step 8: Verify from Garbage Collector View

1. **Login as Garbage Collector**
2. **Navigate to Today's Tasks**
3. **Check:**
   - ✅ Assigned task is visible
   - ✅ Team members listed (truck driver + other collectors)
   - ✅ Route stops visible
   - ✅ Progress updates

---

### Step 9: Admin Verification

1. **Login as Admin**
2. **Check Dashboard:**
   - ✅ Tasks completed count updated
   - ✅ Active personnel count
   - ✅ Statistics accurate

3. **View Reports:**
   - Navigate to relevant report sections
   - Verify task completion data

---

## 🔧 Manual API Triggers (For Testing)

### Generate Tasks for Specific Date
```
https://your-domain.com/cron/auto_generate_all.php?date=YYYY-MM-DD
```

### Mark Absent Personnel (Auto-run at 7:00 AM)
```
https://your-domain.com/cron/auto_mark_absent.php
```

### Create Test Attendance (Bypass time restrictions)
```
https://your-domain.com/backend/test_attendance_bypass.php?date=YYYY-MM-DD&session=AM
```

### Check Cron Logs
```
https://your-domain.com/backend/check_cron_logs.php
```

### Verify Routes Generated
```
https://your-domain.com/backend/check_routes.php?date=YYYY-MM-DD
```

### Check Personnel Assignments
```
https://your-domain.com/backend/check_personnel.php?date=YYYY-MM-DD
```

---

## 🧪 Special Scenarios

### Test Special Pickup Flow

1. **Resident Submits Request:**
   - Login as **Resident**
   - Navigate to **Special Pickup Request**
   - Fill out form:
     - Waste type
     - Quantity
     - Preferred date
     - Address
   - Submit request

2. **Foreman Assigns:**
   - Login as **Foreman**
   - Navigate to **Special Pickup Requests**
   - Click on pending request
   - Assign:
     - Schedule date & time
     - Truck
     - Truck driver
     - Garbage collectors
   - Confirm assignment

3. **Truck Driver Executes:**
   - Login as **Truck Driver**
   - View special pickup in tasks
   - Navigate to location
   - Complete pickup
   - Mark as done

---

### Test Emergency Reporting

1. **Truck Driver Reports Emergency:**
   - During task execution
   - Click **Report Emergency**
   - Fill details
   - Submit

2. **Verify:**
   - ✅ Emergency notification appears
   - ✅ Cannot mark task as done while emergency active
   - ✅ Garbage collectors see emergency alert

3. **Resolve Emergency:**
   - Truck driver marks emergency as resolved
   - Can now complete task

---

### Test Absent Personnel Auto-Mark

1. **Setup:**
   - Create schedule for tomorrow
   - Generate tasks
   - Do NOT time in personnel

2. **Trigger Auto-Mark (at 7:00 AM or manually):**
   ```
   https://your-domain.com/cron/auto_mark_absent.php
   ```

3. **Verify:**
   - ✅ Red dots appear in attendance monitoring
   - ✅ Absent status recorded in database

---

## 🔍 Verification Queries

Access phpMyAdmin on Hostinger and run these queries:

### Check Generated Tasks
```sql
SELECT t.*, s.cluster_id, s.session, s.schedule_date
FROM task t
JOIN schedule s ON t.schedule_id = s.schedule_id
WHERE s.schedule_date = '2025-12-05'
ORDER BY s.session, t.created_at;
```

### Check Routes
```sql
SELECT r.*, t.task_id, s.schedule_date, s.session
FROM route r
JOIN task t ON r.task_id = t.task_id
JOIN schedule s ON t.schedule_id = s.schedule_id
WHERE s.schedule_date = '2025-12-05';
```

### Check Attendance
```sql
SELECT a.*, u.firstname, u.lastname, u.role
FROM attendance a
JOIN user u ON a.user_id = u.user_id
WHERE DATE(a.time_in) = '2025-12-05'
ORDER BY a.time_in;
```

### Check Task Assignments
```sql
SELECT ta.*, u.firstname, u.lastname, u.role, t.status
FROM task_assignment ta
JOIN user u ON ta.user_id = u.user_id
JOIN task t ON ta.task_id = t.task_id
JOIN schedule s ON t.schedule_id = s.schedule_id
WHERE s.schedule_date = '2025-12-05';
```

### Check Route Stops
```sql
SELECT rs.*, cp.location_name, r.route_id
FROM route_stop rs
JOIN collection_point cp ON rs.collection_point_id = cp.collection_point_id
JOIN route r ON rs.route_id = r.route_id
JOIN task t ON r.task_id = t.task_id
JOIN schedule s ON t.schedule_id = s.schedule_id
WHERE s.schedule_date = '2025-12-05'
ORDER BY rs.stop_order;
```

---

## ⚠️ Important Notes

### Time Restrictions
- **AM Session Time-In:** 6:00 AM - 7:00 AM
- **PM Session Time-In:** 12:00 PM - 1:00 PM
- **Auto-Mark Absent:** Runs at 7:00 AM (AM) and 1:00 PM (PM)

### Cron Job Setup
Make sure cron jobs are configured in Hostinger cPanel:
```
0 7 * * * curl -s "https://your-domain.com/cron/auto_mark_absent.php" > /dev/null 2>&1
0 6 * * * curl -s "https://your-domain.com/cron/auto_generate_all.php" > /dev/null 2>&1
```

### Testing Outside Time Windows
Use the bypass API endpoints for testing outside the allowed time windows.

---

## ✅ Success Checklist

- [ ] Schedule created successfully
- [ ] Tasks auto-generated via API trigger
- [ ] Routes created with collection points
- [ ] Personnel assigned correctly
- [ ] Attendance recorded (or bypassed for testing)
- [ ] Truck driver can view tasks
- [ ] Route stops can be completed
- [ ] Task can be marked as done
- [ ] Garbage collectors see assignments
- [ ] Admin dashboard shows accurate data
- [ ] Past tasks show completed tasks

---

## 🐛 Troubleshooting

### Issue: "Unauthorized" error when accessing cron URLs
**Solution:** Check `.htaccess` file - cron endpoints should be accessible

### Issue: Tasks not generated
**Solution:** 
- Verify schedule exists in database
- Check if personnel are approved
- Ensure trucks are available
- Check cron logs

### Issue: Cannot time in
**Solution:**
- Check current server time
- Verify time window (6-7 AM for AM session)
- Use bypass API for testing

### Issue: Route stops not appearing
**Solution:**
- Verify collection points exist for cluster
- Check route generation response
- Query database directly

---

## 📞 Quick Reference URLs

Replace `your-domain.com` with your actual Hostinger domain:

- **Generate Tasks:** `https://your-domain.com/cron/auto_generate_all.php?date=2025-12-05`
- **Mark Absent:** `https://your-domain.com/cron/auto_mark_absent.php`
- **Bypass Attendance:** `https://your-domain.com/backend/test_attendance_bypass.php?date=2025-12-05&session=AM`
- **Check Logs:** `https://your-domain.com/backend/check_cron_logs.php`
- **Check Routes:** `https://your-domain.com/backend/check_routes.php?date=2025-12-05`

---

## 🎯 Next Steps After Successful Test

1. ✅ Document any issues found
2. ✅ Test PM session
3. ✅ Test weekend schedules
4. ✅ Test with multiple clusters
5. ✅ Load test with concurrent users
6. ✅ Verify all notifications work
7. ✅ Test mobile responsiveness
