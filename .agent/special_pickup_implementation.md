# Special Pickup Feature - Complete Implementation

## Summary
Fixed the special pickup scheduling system to properly:
1. Fetch and display trucks in the assignment modal
2. Create task assignments visible in Task Management
3. Send notifications to all involved parties (requester, driver, collectors)

## Changes Made

### 1. Fixed Truck API Response Format
**File:** `backend/api/get_trucks.php`

**Problem:** API was returning wrong response format that didn't match frontend expectations

**Solution:**
- Changed response key from `"success"` to `"status"`
- Changed data key from `"trucks"` to `"data"`
- Mapped database columns to expected frontend fields:
  - `truck_id` → `id`
  - `plate_num` → `plate_number`
  - Auto-generated `truck_number` (e.g., "TRUCK-001")

**Before:**
```json
{
  "success": true,
  "trucks": [...]
}
```

**After:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "truck_number": "TRUCK-001",
      "plate_number": "ABC 123",
      ...
    }
  ]
}
```

### 2. Enhanced Pickup Request Status Update
**File:** `backend/api/update_pickup_request_status.php`

**Problem:** When scheduling a special pickup, the system only updated the request status but didn't:
- Create task assignments
- Send notifications
- Make it visible in Task Management

**Solution:** Added logic to:
1. **Create Collection Schedule Entry**
   - Inserts into `collection_schedule` table
   - Links to pickup request via `special_pickup_id`
   - Sets `schedule_type` to 'special_pickup'
   - Sets `session` to 'special'

2. **Create Collection Team**
   - Inserts into `collection_team` table
   - Assigns truck and driver
   - Links to the schedule entry

3. **Add Team Members**
   - Inserts collectors into `collection_team_member` table
   - Sets initial status to 'pending'

4. **Send Notifications**
   - **To Driver:** "New Special Pickup Assignment" with location and date/time
   - **To Each Collector:** Same notification
   - **To Requester:** "Special Pickup Scheduled" confirmation

### 3. Updated Task Management API
**File:** `backend/api/get_all_task_assignments.php`

**Problem:** Special pickup tasks weren't being identified or displayed properly

**Solution:**
- Added `schedule_type` to SELECT query
- Added `special_pickup_id` to SELECT query
- Included both fields in the response array

This allows the frontend to:
- Identify which tasks are special pickups
- Display them with appropriate labels/badges
- Link back to the original pickup request

### 4. Database Migration
**File:** `migrations/add_special_pickup_to_schedule.sql`

**Purpose:** Adds `special_pickup_id` column to `collection_schedule` table if it doesn't exist

**Note:** This migration needs to be run on the database

## How It Works Now

### Workflow:
1. **Resident submits special pickup request**
   - Request saved in `pickup_requests` table with status 'pending'

2. **Foreman opens Schedule modal**
   - Trucks are fetched from `get_trucks.php` ✅ (FIXED)
   - Personnel (drivers & collectors) are fetched
   - Foreman selects date, time, truck, driver, and collectors

3. **Foreman clicks "Schedule & Assign"**
   - Frontend sends assignment data to `update_pickup_request_status.php`
   - Backend creates:
     - Collection schedule entry
     - Collection team with driver
     - Team members (collectors)
   - Notifications sent to all parties ✅ (NEW)

4. **Task appears in Task Management**
   - Shows in "Today's Tasks" or scheduled tasks
   - Marked with `schedule_type: 'special_pickup'` ✅ (NEW)
   - Includes all assignment details

5. **Personnel receive notifications**
   - Driver gets notified ✅ (NEW)
   - Each collector gets notified ✅ (NEW)
   - Requester gets confirmation ✅ (NEW)

## Testing Checklist

- [ ] Run database migration: `add_special_pickup_to_schedule.sql`
- [ ] Test truck dropdown in Schedule modal - should show trucks
- [ ] Schedule a special pickup with driver and collectors
- [ ] Verify notifications sent to:
  - [ ] Driver
  - [ ] All collectors
  - [ ] Requester
- [ ] Check Task Management page - special pickup should appear
- [ ] Verify task shows correct date, time, and personnel
- [ ] Check that schedule_type is 'special_pickup'

## Files Modified

1. `backend/api/get_trucks.php` - Fixed response format
2. `backend/api/update_pickup_request_status.php` - Added assignment & notification logic
3. `backend/api/get_all_task_assignments.php` - Added special pickup fields
4. `migrations/add_special_pickup_to_schedule.sql` - Database migration (NEW)
5. `backend/api/debug_trucks.php` - Debug endpoint (NEW)

## Next Steps

1. **Run the migration** to add the `special_pickup_id` column
2. **Test the complete flow** from request to assignment
3. **Verify notifications** are working properly
4. **Check Task Management** displays special pickups correctly

## Notes

- The system now uses the existing `collection_schedule` and `collection_team` structure
- Special pickups are integrated into the same task management system as regular collections
- They can be identified by `schedule_type = 'special_pickup'`
- The `special_pickup_id` links back to the original request in `pickup_requests` table
