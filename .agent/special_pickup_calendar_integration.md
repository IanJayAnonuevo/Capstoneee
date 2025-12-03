# Special Pickup Calendar Integration - Updated Implementation

## Problem
- Special pickups were being stored in `predefined_schedules` which is for **recurring** schedules
- Once completed, special pickups should **disappear** from the calendar
- Predefined schedules are templates that repeat, not one-time events

## Solution

### 1. Use `collection_schedule` for One-Time Special Pickups
Instead of `predefined_schedules`, special pickups are now stored in `collection_schedule` with:
- `schedule_type = 'special_pickup'`
- `special_pickup_id` linking to the pickup request
- Specific `scheduled_date` (not recurring)

### 2. New API Endpoint: `get_calendar_schedules.php`
This endpoint returns **both**:
- **Predefined recurring schedules** (from `predefined_schedules` table)
- **One-time special pickups** (from `collection_schedule` table)

**Key Feature:** Special pickups only appear if their status is 'scheduled' or 'pending'. Once marked as 'completed', they automatically disappear from the calendar.

## API Usage

### Endpoint
```
GET /backend/api/get_calendar_schedules.php
```

### Query Parameters
- `schedule_type` (optional) - Filter by type (e.g., 'daily_priority,fixed_days')
- `cluster_id` (optional) - Filter by cluster
- `start_date` (optional) - For filtering special pickups by date range
- `end_date` (optional) - For filtering special pickups by date range

### Response Format
```json
{
  "success": true,
  "message": "Schedules retrieved successfully",
  "schedules": [
    {
      "schedule_template_id": 123,
      "barangay_id": 1,
      "barangay_name": "South Centro",
      "cluster_id": "1C-PB",
      "schedule_type": "daily_priority",
      "day_of_week": "Monday",
      "start_time": "08:00:00",
      "end_time": "12:00:00",
      "source_type": "predefined",
      "special_pickup_id": null,
      "scheduled_date": null
    },
    {
      "schedule_template_id": 456,
      "barangay_id": 2,
      "barangay_name": "North Centro",
      "cluster_id": null,
      "schedule_type": "special_pickup",
      "day_of_week": "Wednesday",
      "start_time": "10:00:00",
      "end_time": null,
      "source_type": "special_pickup",
      "special_pickup_id": 789,
      "scheduled_date": "2025-12-05"
    }
  ],
  "total_count": 2,
  "predefined_count": 1,
  "special_pickup_count": 1
}
```

### Identifying Special Pickups
Check the `source_type` field:
- `"predefined"` = Recurring schedule
- `"special_pickup"` = One-time special pickup

## Frontend Integration

### Option 1: Update Existing Components (Recommended)
Update the calendar components to use the new endpoint:

**Files to update:**
- `src/components/foreman/ForemanSchedule.jsx`
- `src/components/admin/ManageSchedule.jsx`
- `src/components/truckdriver/TruckDriverScheduleCalendar.jsx`
- `src/components/garbagecollector/GarbageCollectorScheduleCalendar.jsx`

**Change:**
```javascript
// OLD
const url = `${buildApiUrl('get_predefined_schedules.php')}?${params.toString()}`;

// NEW
const url = `${buildApiUrl('get_calendar_schedules.php')}?${params.toString()}`;
```

### Option 2: Keep Both Endpoints
If you want to maintain backward compatibility:
- Use `get_predefined_schedules.php` for managing recurring schedules
- Use `get_calendar_schedules.php` for displaying the calendar view

## How It Works

### When Special Pickup is Scheduled:
1. Foreman assigns personnel and sets date/time
2. Backend creates entry in `collection_schedule`:
   ```sql
   INSERT INTO collection_schedule 
   (barangay_id, scheduled_date, start_time, schedule_type, session, special_pickup_id)
   VALUES (1, '2025-12-05', '10:00:00', 'special_pickup', 'special', 789)
   ```
3. Entry appears in calendar via `get_calendar_schedules.php`

### When Special Pickup is Completed:
1. Pickup request status changes to 'completed'
2. Query in `get_calendar_schedules.php` filters it out:
   ```sql
   WHERE cs.schedule_type = 'special_pickup'
   AND pr.status IN ('scheduled', 'pending')  -- Excludes 'completed'
   ```
3. Special pickup **disappears** from calendar automatically ✅

## Database Schema

### Required Column
The `collection_schedule` table needs a `special_pickup_id` column:

```sql
-- Run this migration
ALTER TABLE collection_schedule 
ADD COLUMN special_pickup_id INT NULL,
ADD INDEX idx_special_pickup (special_pickup_id);
```

**Migration file:** `migrations/add_special_pickup_to_schedule.sql`

## Testing

### Test Scenario 1: Schedule Special Pickup
1. Login as Foreman
2. Go to Special Pickup page
3. Click "Schedule" on a pending request
4. Assign personnel, truck, date, time
5. Submit
6. **Expected:** Special pickup appears in calendar on the scheduled date

### Test Scenario 2: Complete Special Pickup
1. Mark the special pickup as completed
2. Refresh the calendar
3. **Expected:** Special pickup no longer appears in calendar

### Test Scenario 3: Mixed View
1. Create both predefined schedules and special pickups
2. View calendar
3. **Expected:** Both types appear together
4. **Verify:** Can distinguish by `source_type` or visual indicator

## Visual Differentiation (Frontend)

Consider adding visual indicators for special pickups:

```javascript
const getScheduleStyle = (schedule) => {
  if (schedule.source_type === 'special_pickup') {
    return {
      backgroundColor: '#FFA500', // Orange for special pickups
      border: '2px dashed #FF8C00',
      icon: '⚡' // Special icon
    };
  }
  return {
    backgroundColor: '#10B981', // Green for regular
    border: '2px solid #059669'
  };
};
```

## Summary of Changes

### New Files
1. `backend/api/get_calendar_schedules.php` - Combined calendar endpoint
2. `migrations/add_special_pickup_to_schedule.sql` - Database migration

### Modified Files
1. `backend/api/update_pickup_request_status.php` - Creates collection_schedule entries
2. `backend/config/rbac.php` - Added RBAC permissions
3. `backend/api/get_all_task_assignments.php` - Includes special_pickup_id

### Next Steps
1. ✅ Run database migration
2. ⏳ Update frontend calendar components to use new endpoint
3. ⏳ Add visual differentiation for special pickups
4. ⏳ Test complete workflow

## Benefits
✅ Special pickups are one-time events, not recurring
✅ Automatically disappear when completed
✅ Integrated with existing task management system
✅ Backward compatible (old endpoint still works)
✅ Clear separation between recurring and one-time schedules
