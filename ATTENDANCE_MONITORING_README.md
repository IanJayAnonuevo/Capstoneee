# Attendance Monitoring Feature - Quick Start

## 🚀 Quick Setup (3 Steps)

### Step 1: Install Database Table
Run ONE of these:
```bash
# Option A: Batch file (Windows)
setup-attendance.bat

# Option B: PowerShell (Recommended)
.\setup-attendance.ps1

# Option C: Manual via phpMyAdmin
# Open phpMyAdmin -> kolektrash_db -> SQL tab
# Paste contents of add_attendance_table.sql -> Click Go
```

### Step 2: Verify API
Open in browser:
```
http://localhost/kolektrash/test-attendance-api.html
```
Click each "Test" button to verify APIs are working.

### Step 3: Use the Feature
1. Login as foreman: `foreman@gmail.com`
2. Click "Monitor Attendance"
3. Enter personnel ID (e.g., 16 for Paul)
4. Select AM/PM
5. Click "Record Time In"

## 📋 Files Created

### Database
- `add_attendance_table.sql` - Creates attendance table

### Backend APIs
- `backend/api/record_attendance.php` - Record time in/out
- `backend/api/get_attendance.php` - Get attendance records
- `backend/api/search_personnel.php` - Search personnel

### Frontend
- `src/components/foreman/ForemanAttendance.jsx` - Updated component

### Documentation
- `FOREMAN_ATTENDANCE_GUIDE.md` - Complete guide
- `ATTENDANCE_MONITORING_README.md` - This file
- `test-attendance-api.html` - API testing tool

### Setup Scripts
- `setup-attendance.bat` - Windows batch setup
- `setup-attendance.ps1` - PowerShell setup

## 🎯 Features

✅ **ID Input with Search**
- Type personnel ID directly
- Search by name (auto-complete)
- Dropdown selection

✅ **Time Recording**
- Morning (AM) and Afternoon (PM) sessions
- Time In / Time Out tracking
- Automatic timestamp recording

✅ **Live Attendance Table**
- Shows all personnel
- Status indicators (Present/Pending/Absent)
- Time stamps displayed
- Auto-refresh after recording

✅ **Summary Statistics**
- Total present/absent by role
- AM/PM breakdown
- Driver vs Collector counts

## 🧪 Test Data

### Personnel IDs to Test
- **Driver 16**: Paul Bermal (paulbermal@gmail.com)
- **Driver 17**: Ronald Frondozo
- **Collector 28**: Alvin Monida
- **Collector 29**: Rico Maralit
- **Collector 30**: Joseph Osela

### Test Foreman
- **User ID**: 91
- **Email**: foreman@gmail.com
- **Username**: foreman

## 🔍 How It Works

1. **Foreman enters personnel ID** → System searches database
2. **Foreman selects session (AM/PM)** → Time is recorded
3. **Foreman clicks Record** → API saves to database
4. **Table updates automatically** → Shows new attendance
5. **Summary recalculates** → Stats update in real-time

## 📊 Database Schema

```sql
attendance (
  attendance_id INT PRIMARY KEY,
  user_id INT,              -- Personnel user ID
  attendance_date DATE,     -- Date of attendance
  session ENUM('AM','PM'),  -- Morning or Afternoon
  time_in TIME,             -- Time in timestamp
  time_out TIME,            -- Time out timestamp
  status ENUM,              -- present/absent/on-leave/pending
  recorded_by INT,          -- Foreman's user_id
  notes TEXT,               -- Optional notes
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 🐛 Troubleshooting

### Problem: "Database connection failed"
**Solution**: Make sure XAMPP MySQL is running

### Problem: "Personnel not found"
**Solution**: Check user_id exists and role_id is 3 (driver) or 4 (collector)

### Problem: "Already timed in"
**Solution**: Person already has time_in for that session. Use Time Out instead.

### Problem: "API returns 404"
**Solution**: Verify files are in `backend/api/` folder

## 📱 UI Guide

### Recording Form
```
┌─────────────────────────────────┐
│  Date: [2025-11-20]             │
│  Session: [AM] [PM]             │
│  ID/Name: [16_____________]🔍   │
│  Action: [Time In] [Time Out]   │
│  [Record Attendance]            │
└─────────────────────────────────┘
```

### Attendance Table
```
ID  | Name          | Role      | AM In  | AM Out | PM In  | PM Out
----|---------------|-----------|--------|--------|--------|--------
16  | Paul Bermal   | Driver    | ⚫8:00 | ⚫5:00 | ⚫1:00 | ⚪
28  | Alvin Monida  | Collector | ⚫8:15 | ⚫5:15 | ⚪     | ⚪

⚫ = Has record  ⚪ = Pending
```

## 🎨 Status Colors
- 🟢 Green = Present (time in recorded)
- 🟠 Orange = Time out recorded
- ⚪ Gray = Pending (no record)
- 🟡 Yellow = On leave
- 🔴 Red = Absent

## 💡 Tips
- Use Tab key to navigate form quickly
- Search works with partial names
- Can record past dates
- Summary updates automatically
- Print button exports to PDF (browser print)

## 📞 Support
For issues, check:
1. Browser console (F12)
2. XAMPP error logs
3. Database connection
4. API test page results

---
**Version**: 1.0  
**Date**: November 20, 2025  
**Status**: ✅ Ready to Use
