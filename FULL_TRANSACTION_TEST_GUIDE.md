# Full Transaction Testing Guide

This guide will walk you through testing the complete transaction flow of the KolekTrash system, from schedule creation to task completion.

## Overview

A full transaction in KolekTrash involves:
1. **Schedule Creation** (Admin)
2. **Automated Task Generation** (Cron Job)
3. **Personnel Attendance** (Foreman/Personnel)
4. **Task Assignment Verification** (Foreman)
5. **Task Execution** (Truck Driver & Garbage Collectors)
6. **Route Completion** (Truck Driver)
7. **Verification & Monitoring** (Admin/Foreman)

---

## Prerequisites

Before starting the test, ensure:
- [ ] XAMPP is running (Apache & MySQL)
- [ ] Frontend dev server is running (`npm run dev`)
- [ ] Database has test data (users, barangays, clusters, collection points)
- [ ] At least 1 truck is available
- [ ] At least 1 approved truck driver
- [ ] At least 2 approved garbage collectors

---

## Test Scenario

**Test Date:** December 5, 2025  
**Session:** AM (Morning)  
**Cluster:** 1C-PB (or any available cluster)

---

## Step 1: Schedule Creation (Admin)

### Actions:
1. Login as **Admin**
2. Navigate to **Schedule Management** → **Manage Schedule**
3. Create a new schedule:
   - **Date:** December 5, 2025
   - **Session:** AM
   - **Cluster:** 1C-PB
   - **Schedule Type:** Daily Priority Route
4. Click **Add Schedule**

### Expected Results:
- ✅ Schedule appears in the calendar view
- ✅ Success notification displayed
- ✅ Schedule is saved in database (`schedule` table)

### Verification Query:
```sql
SELECT * FROM schedule 
WHERE schedule_date = '2025-12-05' 
AND session = 'AM' 
ORDER BY created_at DESC;
```

---

## Step 2: Automated Task Generation (Cron Job)

### Manual Trigger (for testing):

#### Option A: Using HTML Test Page
1. Open `test_auto_generate.html` in browser
2. Select date: **December 5, 2025**
3. Click **Generate Tasks & Routes**

#### Option B: Using PowerShell
```powershell
# Navigate to project directory
cd c:\xampp\htdocs\kolektrash

# Run the cron job manually
.\test_auto_generate.ps1
```

#### Option C: Direct API Call
```
GET http://localhost/kolektrash/cron/auto_generate_all.php?date=2025-12-05
```

### Expected Results:
- ✅ Tasks created in `task` table
- ✅ Routes created in `route` table
- ✅ Route stops created in `route_stop` table
- ✅ Personnel assigned to tasks
- ✅ Truck assigned to route

### Verification Queries:
```sql
-- Check generated tasks
SELECT t.*, s.cluster_id, s.session 
FROM task t
JOIN schedule s ON t.schedule_id = s.schedule_id
WHERE s.schedule_date = '2025-12-05' 
AND s.session = 'AM';

-- Check generated routes
SELECT r.*, t.task_id 
FROM route r
JOIN task t ON r.task_id = t.task_id
JOIN schedule s ON t.schedule_id = s.schedule_id
WHERE s.schedule_date = '2025-12-05' 
AND s.session = 'AM';

-- Check route stops
SELECT rs.*, cp.location_name 
FROM route_stop rs
JOIN collection_point cp ON rs.collection_point_id = cp.collection_point_id
JOIN route r ON rs.route_id = r.route_id
JOIN task t ON r.task_id = t.task_id
JOIN schedule s ON t.schedule_id = s.schedule_id
WHERE s.schedule_date = '2025-12-05' 
AND s.session = 'AM';

-- Check personnel assignments
SELECT ta.*, u.firstname, u.lastname, u.role 
FROM task_assignment ta
JOIN user u ON ta.user_id = u.user_id
JOIN task t ON ta.task_id = t.task_id
JOIN schedule s ON t.schedule_id = s.schedule_id
WHERE s.schedule_date = '2025-12-05' 
AND s.session = 'AM';
```

---

## Step 3: Personnel Attendance (Morning)

### Actions:

#### 3A: Truck Driver Time-In
1. Login as **Truck Driver**
2. Navigate to **Dashboard**
3. Click **Time In** button (available 6:00 AM - 7:00 AM)
4. Confirm time-in

#### 3B: Garbage Collectors Time-In
1. Login as **Garbage Collector 1**
2. Navigate to **Dashboard**
3. Click **Time In** button
4. Confirm time-in
5. Repeat for **Garbage Collector 2**

#### 3C: Foreman Verification
1. Login as **Foreman**
2. Navigate to **Attendance Monitoring**
3. Verify all personnel have green dots (present)

### Expected Results:
- ✅ Green dots appear for all personnel who timed in
- ✅ Attendance records created in `attendance` table
- ✅ `verification_status` = 'approved'
- ✅ Time-in button disabled after successful time-in

### Verification Query:
```sql
SELECT a.*, u.firstname, u.lastname, u.role 
FROM attendance a
JOIN user u ON a.user_id = u.user_id
WHERE DATE(a.time_in) = '2025-12-05'
ORDER BY a.time_in DESC;
```

---

## Step 4: Task Assignment Verification (Foreman)

### Actions:
1. Login as **Foreman**
2. Navigate to **Today's Tasks**
3. Verify task details:
   - Assigned truck driver
   - Assigned garbage collectors
   - Truck assignment
   - Route details

### Expected Results:
- ✅ All tasks for December 5, AM session are visible
- ✅ Personnel names are displayed correctly
- ✅ Truck information is shown
- ✅ Route stops are listed

---

## Step 5: Task Execution (Truck Driver)

### Actions:
1. Login as **Truck Driver**
2. Navigate to **Today's Tasks**
3. View assigned task for AM session
4. Click on the task to see route details
5. For each collection point:
   - Navigate to the location
   - Click **Mark as Completed**
   - Upload proof photo (optional)
   - Confirm completion

### Expected Results:
- ✅ Route stops appear in order
- ✅ Each stop can be marked as completed
- ✅ Proof photos can be uploaded
- ✅ Progress indicator updates
- ✅ Map shows route (if live map is enabled)

### Verification Query:
```sql
SELECT rs.*, rs.status, rs.proof_photo 
FROM route_stop rs
JOIN route r ON rs.route_id = r.route_id
JOIN task t ON r.task_id = t.task_id
JOIN schedule s ON t.schedule_id = s.schedule_id
WHERE s.schedule_date = '2025-12-05' 
AND s.session = 'AM'
ORDER BY rs.stop_order;
```

---

## Step 6: Task Completion (Truck Driver)

### Actions:
1. After all route stops are completed
2. Click **Mark Task as Done** button
3. Confirm task completion

### Expected Results:
- ✅ Task status changes to 'completed'
- ✅ Route status changes to 'completed'
- ✅ Completion timestamp recorded
- ✅ Task disappears from active tasks
- ✅ Task appears in **Past Tasks**

### Verification Query:
```sql
SELECT t.*, t.status, t.completed_at 
FROM task t
JOIN schedule s ON t.schedule_id = s.schedule_id
WHERE s.schedule_date = '2025-12-05' 
AND s.session = 'AM';
```

---

## Step 7: Garbage Collector View

### Actions:
1. Login as **Garbage Collector**
2. Navigate to **Today's Tasks**
3. View assigned task details
4. See team members (truck driver + other collectors)
5. Monitor task progress

### Expected Results:
- ✅ Assigned task is visible
- ✅ Team members are listed with full names
- ✅ Route stops are visible
- ✅ Progress updates in real-time (if refreshed)

---

## Step 8: Verification & Monitoring (Admin/Foreman)

### Admin Actions:
1. Login as **Admin**
2. Navigate to **Dashboard**
3. Check statistics:
   - Tasks completed today
   - Active personnel
   - Truck status
4. Navigate to **Reports** (if available)
5. View task completion reports

### Foreman Actions:
1. Login as **Foreman**
2. Navigate to **Past Tasks**
3. Filter by date: December 5, 2025
4. Verify completed tasks
5. Check route completion details

### Expected Results:
- ✅ Dashboard shows updated statistics
- ✅ Completed tasks appear in past tasks
- ✅ All route stops marked as completed
- ✅ Proof photos are accessible (if uploaded)

---

## Special Scenarios to Test

### Scenario A: Special Pickup Request

1. **Resident** submits special pickup request
2. **Foreman** reviews and assigns:
   - Schedule date & time
   - Truck
   - Truck driver
   - Garbage collectors
3. **Truck Driver** executes special pickup
4. **Truck Driver** marks as completed

### Scenario B: Emergency Reporting

1. **Truck Driver** reports emergency during task
2. **Garbage Collector** sees emergency notification
3. **Truck Driver** cannot mark task as done while emergency is active
4. **Truck Driver** resolves emergency
5. **Truck Driver** completes task

### Scenario C: Absent Personnel

1. Personnel fails to time in before 7:00 AM
2. **Cron Job** auto-marks as absent at 7:00 AM
3. **Foreman** sees red dot in attendance monitoring
4. Tasks are reassigned or handled accordingly

---

## Troubleshooting

### Issue: Tasks not generated
**Solution:**
- Check if schedule exists for the date
- Verify personnel are approved
- Check truck availability
- Review cron job logs: `logs/cron_*.log`

### Issue: Personnel cannot time in
**Solution:**
- Check current time (must be within 6:00 AM - 7:00 AM for AM session)
- Verify user role is correct
- Check if already timed in today

### Issue: Route stops not appearing
**Solution:**
- Verify collection points exist for the cluster
- Check route generation in database
- Ensure route_stop table has entries

### Issue: Task cannot be marked as done
**Solution:**
- Verify all route stops are completed
- Check for active emergencies
- Ensure user is the assigned truck driver

---

## Database Cleanup (After Testing)

To reset the test data:

```sql
-- Delete test attendance records
DELETE FROM attendance WHERE DATE(time_in) = '2025-12-05';

-- Delete test route stops
DELETE rs FROM route_stop rs
JOIN route r ON rs.route_id = r.route_id
JOIN task t ON r.task_id = t.task_id
JOIN schedule s ON t.schedule_id = s.schedule_id
WHERE s.schedule_date = '2025-12-05';

-- Delete test routes
DELETE r FROM route r
JOIN task t ON r.task_id = t.task_id
JOIN schedule s ON t.schedule_id = s.schedule_id
WHERE s.schedule_date = '2025-12-05';

-- Delete test task assignments
DELETE ta FROM task_assignment ta
JOIN task t ON ta.task_id = t.task_id
JOIN schedule s ON t.schedule_id = s.schedule_id
WHERE s.schedule_date = '2025-12-05';

-- Delete test tasks
DELETE t FROM task t
JOIN schedule s ON t.schedule_id = s.schedule_id
WHERE s.schedule_date = '2025-12-05';

-- Delete test schedules
DELETE FROM schedule WHERE schedule_date = '2025-12-05';
```

---

## Success Criteria

The full transaction test is successful if:
- ✅ Schedule is created successfully
- ✅ Tasks and routes are auto-generated
- ✅ Personnel can time in successfully
- ✅ Attendance is tracked correctly
- ✅ Tasks are assigned to correct personnel
- ✅ Truck driver can view and execute routes
- ✅ Route stops can be marked as completed
- ✅ Tasks can be marked as done
- ✅ Garbage collectors can view their assignments
- ✅ Admin/Foreman can monitor progress
- ✅ All data is correctly stored in database

---

## Next Steps

After successful testing:
1. Document any bugs or issues found
2. Test edge cases (absent personnel, emergencies, etc.)
3. Test PM (afternoon) session
4. Test weekend schedules
5. Test special pickup flow
6. Perform load testing with multiple concurrent tasks
