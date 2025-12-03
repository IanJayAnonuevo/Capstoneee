# Admin Schedule - Special Pickup Integration Plan

## Changes Required for ManageSchedule.jsx

### 1. State Management
- Add state for special pickup schedules
- Track special pickup count

### 2. Fetch Logic Updates
**Current**: Fetches only from `get_predefined_schedules.php`
**New**: Also fetch from `get_calendar_schedules.php` for special pickups

```javascript
// Add to fetchSchedules function
const weekStart = getWeekStart(currentWeek);
const weekEnd = new Date(weekStart);
weekEnd.setDate(weekStart.getDate() + 6);

const calendarParams = new URLSearchParams({
  start_date: weekStart.toISOString().split('T')[0],
  end_date: weekEnd.toISOString().split('T')[0],
  schedule_type: 'special_pickup'
});

const specialPickupRes = await fetch(
  `${buildApiUrl('get_calendar_schedules.php')}?${calendarParams}`,
  { headers: getAuthHeaders() }
);
```

### 3. Event Map Updates
Add special pickups to eventMap with:
- Orange gradient background
- Orange border
- Special pickup flag
- Read-only indicator

### 4. Click Handler Protection
Update onClick to block special pickup edits:
```javascript
if (event.isSpecialPickup || event.scheduleType === 'special_pickup') {
  e.preventDefault();
  e.stopPropagation();
  return;
}
```

### 5. Dropdown Menu Protection
Hide Edit/Delete for special pickups:
```javascript
{event.isSpecialPickup ? (
  <div className="px-3 py-2 text-xs text-gray-500 italic">
    Cannot edit/delete special pickup schedules from calendar
  </div>
) : (
  // Edit/Delete buttons
)}
```

### 6. History Integration
Update fetchScheduleHistory to include completed special pickups

## Files to Modify
1. `src/components/admin/ManageSchedule.jsx` - Main schedule component

## Testing Checklist
- [ ] Special pickups appear with orange styling
- [ ] Cannot click to edit special pickups
- [ ] Dropdown menu shows "Cannot edit/delete" message
- [ ] History includes completed special pickups
- [ ] Regular schedules still work normally
