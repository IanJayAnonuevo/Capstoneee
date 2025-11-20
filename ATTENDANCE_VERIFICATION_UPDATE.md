# Attendance System Update - Verification Workflow

## 🔄 System Change

**OLD WAY:** Foreman directly records attendance
**NEW WAY:** Personnel time in → Foreman verifies

## 📋 What Changed

### 1. Database Update
- Added `verification_status` field (pending/verified/rejected)
- Added `verified_by` field (foreman user_id)
- Added `verified_at` timestamp
- Added `verification_notes` field

### 2. New APIs
- `personnel_time_in.php` - Personnel self-recording
- `verify_attendance.php` - Foreman verification
- `get_pending_attendance.php` - Get records to verify

### 3. Updated Components
- **ForemanAttendance.jsx** - Now shows verification interface instead of recording form

## 🚀 Quick Setup

### Step 1: Update Database
```bash
# Run this in XAMPP MySQL or phpMyAdmin
mysql -u root kolektrash_db < update_attendance_verification.sql

# OR via phpMyAdmin:
# 1. Open phpMyAdmin
# 2. Select kolektrash_db
# 3. Go to SQL tab
# 4. Paste contents of update_attendance_verification.sql
# 5. Click Go
```

### Step 2: Test Personnel Time In
1. Open: `http://localhost/Capstoneee/personnel-time-in.html`
2. Enter Personnel ID: `16` (Paul Bermal - Driver)
3. Select Session: **AM**
4. Click **✅ Time In**
5. Should see: "Time in recorded. Waiting for foreman verification."

### Step 3: Test Foreman Verification
1. Login as foreman in main app
2. Go to **Monitor Attendance**
3. Should see pending record in yellow
4. Click **Verify** button
5. Record status changes to "Verified"

## 🎯 New Workflow

### For Personnel (Driver/Collector):
1. Open personnel time-in page on their device
2. Enter their user ID
3. Select AM or PM session
4. Click "Time In" button
5. System records attendance with "pending" status
6. Message shows: "Waiting for foreman verification"

### For Foreman:
1. Open attendance monitoring page
2. See list of "Pending" attendance
3. Yellow alert shows: "X records waiting for verification"
4. For each record:
   - Check if person is actually on site
   - Click ✅ **Verify** if present
   - Click ❌ **Reject** if not present
5. Verified records move to "Verified" tab
6. Rejected records move to "Rejected" tab

## 📊 Foreman Interface Features

### Filter Tabs
- **Pending** (Yellow) - Needs verification
- **Verified** (Green) - Confirmed on-site
- **All** (Blue) - Show everything

### Pending Alert
- Shows count of unverified attendance
- Click to go directly to pending list
- Updates in real-time

### Verification Table
Shows for each record:
- Personnel ID
- Name
- Role (Driver/Collector)
- Session (AM/PM)
- Time In
- Time Out (if recorded)
- Status badge
- Action buttons (Verify/Reject)

### Quick Stats
- Pending count by session (AM/PM)
- Verified count
- Rejected count
- Total for the day

## 🧪 Testing Scenarios

### Test 1: Normal Flow
1. **Personnel:** Time in at 8:00 AM
2. **Status:** Shows as "Pending"
3. **Foreman:** Sees in pending list
4. **Foreman:** Clicks Verify
5. **Status:** Changes to "Verified" ✅

### Test 2: False Time In
1. **Personnel:** Times in remotely (not on site)
2. **Status:** Shows as "Pending"
3. **Foreman:** Checks site - person not there
4. **Foreman:** Clicks Reject
5. **Status:** Changes to "Rejected" ❌

### Test 3: Multiple Personnel
1. **3 Personnel:** All time in within 5 minutes
2. **Foreman:** Sees "3 records waiting"
3. **Foreman:** Goes to pending tab
4. **Foreman:** Verifies each one-by-one
5. **Result:** All moved to verified

## 📱 Personnel Time-In Page

### Access
```
http://localhost/Capstoneee/personnel-time-in.html
```

### Features
- ⏰ Live clock display
- 📅 Current date
- 🆔 Personnel ID input
- 🌅 AM/PM session toggle
- ✅ Time In button
- 🚪 Time Out button
- 📧 Success/Error messages

### For Production
- Can be accessed on mobile devices
- Simple interface for quick time-in
- Shows confirmation message
- No login required (ID-based)

## 🔐 Security Notes

### Personnel Side
- Only drivers and collectors (role_id 3,4) can time in
- Can't time in twice for same session
- Must have user record in database

### Foreman Side
- Only foreman (role_id 7) can verify
- Can verify or reject any pending record
- Changes are logged with timestamp
- Can view all statuses

## 📂 Files Created/Modified

### SQL
- ✅ `update_attendance_verification.sql` - Database update

### Backend APIs
- ✅ `backend/api/personnel_time_in.php` - Personnel recording
- ✅ `backend/api/verify_attendance.php` - Foreman verification
- ✅ `backend/api/get_pending_attendance.php` - Get pending records

### Frontend
- ✅ `ForemanAttendance.jsx` - Updated verification interface
- ✅ `personnel-time-in.html` - Personnel time-in page

### Documentation
- ✅ `ATTENDANCE_VERIFICATION_UPDATE.md` - This file

## 💡 Usage Tips

### For Foreman
- Check pending list regularly (every hour)
- Verify promptly to avoid backlog
- Use reject for false time-ins
- View "All" tab for complete overview

### For Personnel
- Time in immediately upon arrival
- Wait for foreman to verify
- Don't time in if not on site
- Time out when leaving

## 🔧 Troubleshooting

### "No pending records"
- Personnel haven't timed in yet
- All records already verified
- Check different date

### "Verification failed"
- Check foreman is logged in
- Verify role_id is 7
- Check database connection

### "Already timed in"
- Personnel already has record for that session
- Use time out button instead
- Or select different session

## 📞 Support

If issues occur:
1. Check browser console (F12)
2. Verify database updated correctly
3. Check API responses
4. Test with known personnel IDs (16, 17, 28, 29, 30)

---
**Updated:** November 20, 2025
**Version:** 2.0 (Verification Workflow)
**Status:** ✅ Ready to Use
