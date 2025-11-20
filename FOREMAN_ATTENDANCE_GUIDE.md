# Attendance Monitoring Feature - Implementation Guide

## Overview
The Attendance Monitoring feature allows foremen to record and track attendance for truck drivers and garbage collectors using their personnel ID. The system supports both morning (AM) and afternoon (PM) sessions with time-in and time-out functionality.

## Installation Steps

### 1. Database Setup

Run the SQL migration to create the attendance table:

```sql
-- Run this in phpMyAdmin or MySQL command line
SOURCE c:\xampp\htdocs\Capstoneee\add_attendance_table.sql;
```

Or manually execute the SQL in phpMyAdmin:
1. Open phpMyAdmin
2. Select the `kolektrash_db` database
3. Go to SQL tab
4. Copy and paste the contents of `add_attendance_table.sql`
5. Click "Go" to execute

### 2. Backend API Files

The following API files have been created in `backend/api/`:

- **record_attendance.php** - Records time in/out for personnel
- **get_attendance.php** - Retrieves attendance records for a specific date
- **search_personnel.php** - Searches for personnel by ID or name

These files are ready to use and follow the existing project structure.

### 3. Frontend Component

The `ForemanAttendance.jsx` component has been updated with the following features:

- Personnel ID input with real-time search
- Session selection (AM/PM)
- Time in/out action buttons
- Live attendance table with status indicators
- Summary statistics
- Date selection

## How to Use

### For Foreman:

1. **Navigate to Attendance Monitoring**
   - From the Foreman Home page, click "Monitor Attendance"

2. **Record Attendance**
   - Enter personnel ID or start typing name to search
   - Select the session (Morning AM or Afternoon PM)
   - Choose action (Time In or Time Out)
   - Click "Record" button

3. **View Attendance Records**
   - The table below shows all personnel and their attendance status
   - Green dot = Present (with time displayed)
   - Orange dot = Time out recorded
   - Gray dot = Pending/No record
   - Times are displayed below the status indicators

4. **View Summary**
   - Summary table shows totals by designation and session
   - Statistics update automatically after recording

## Features

### Input Methods
- **Direct ID Entry**: Type the numerical user ID
- **Name Search**: Start typing first or last name to search
- **Dropdown Selection**: Click on search results to auto-fill

### Status Types
- **Present**: Time in recorded successfully
- **Absent**: No time in record (auto-determined)
- **On-leave**: Manual status (can be set via database)
- **Pending**: Not yet recorded

### Validations
- Cannot time out without timing in first
- Prevents duplicate time in for same session
- Validates personnel exists and has correct role (driver/collector)
- Shows success/error messages

## API Endpoints

### Record Attendance
```javascript
POST /backend/api/record_attendance.php
Body: {
  "user_id": 16,
  "attendance_date": "2025-11-20",
  "session": "AM",
  "action": "time_in",
  "recorded_by": 91
}
```

### Get Attendance
```javascript
GET /backend/api/get_attendance.php?date=2025-11-20
```

### Search Personnel
```javascript
GET /backend/api/search_personnel.php?search=Paul
```

## Database Schema

### attendance table
```sql
- attendance_id: INT (Primary Key, Auto Increment)
- user_id: INT (Foreign Key to user.user_id)
- attendance_date: DATE
- session: ENUM('AM', 'PM')
- time_in: TIME
- time_out: TIME
- status: ENUM('present', 'absent', 'on-leave', 'pending')
- recorded_by: INT (Foreman's user_id)
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify XAMPP MySQL is running
   - Check database credentials in `backend/config/database.php`

2. **API Not Found (404)**
   - Ensure files are in correct directory: `backend/api/`
   - Check file permissions

3. **Personnel Not Found**
   - Verify user exists in database with role_id 3 (driver) or 4 (collector)
   - Check user_id is correct

4. **Already Timed In/Out**
   - Check attendance table for existing records
   - Use correct session (AM/PM)

## Future Enhancements

Suggested improvements:
- [ ] Export to Excel/PDF functionality
- [ ] Print attendance report
- [ ] Bulk time in/out
- [ ] QR code scanning for ID
- [ ] SMS notifications
- [ ] Attendance history view
- [ ] Late/overtime calculations
- [ ] Photo capture on time in

## Testing

### Test Personnel IDs
Based on your database:
- Driver: 16 (Paul Bermal), 17 (Ronald Frondozo)
- Collector: 28 (Alvin), 29 (Rico), 30 (Joseph)

### Test Foreman
- User ID: 91 (foreman@gmail.com)
- Username: foreman

## Notes

- Attendance records are unique per user, date, and session
- Times are automatically recorded when attendance is logged
- The foreman user ID is stored in recorded_by field for audit purposes
- Status automatically changes to 'present' when time in is recorded
- Summary statistics update in real-time after each record

## Support

For issues or questions:
1. Check browser console for JavaScript errors
2. Check PHP error logs in XAMPP
3. Verify database connections
4. Test API endpoints directly using Postman or browser

---
**Created**: November 20, 2025
**Version**: 1.0
