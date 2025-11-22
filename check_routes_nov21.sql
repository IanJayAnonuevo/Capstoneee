-- Check daily_route records for November 21, 2025
-- Run this to see if routes exist for that specific date

-- Check routes for November 21, 2025
SELECT 
    dr.id as route_id,
    dr.date,
    dr.barangay_name,
    dr.barangay_id,
    dr.team_id,
    ct.driver_id,
    cs.scheduled_date,
    cs.barangay_id as schedule_barangay_id,
    b.barangay_name as barangay_name_from_table
FROM daily_route dr
LEFT JOIN collection_team ct ON dr.team_id = ct.team_id
LEFT JOIN collection_schedule cs ON ct.schedule_id = cs.schedule_id
LEFT JOIN barangay b ON dr.barangay_id = b.barangay_id
WHERE dr.date = '2025-11-21'
ORDER BY dr.date, dr.start_time;

-- Check all routes regardless of date
SELECT 
    dr.id as route_id,
    dr.date,
    dr.barangay_name,
    dr.barangay_id,
    dr.team_id,
    dr.status
FROM daily_route dr
WHERE dr.date >= '2025-11-21'
ORDER BY dr.date, dr.start_time
LIMIT 20;

-- Check if there are schedules for Nov 21 without matching routes
SELECT 
    cs.schedule_id,
    cs.scheduled_date,
    b.barangay_name,
    cs.barangay_id as schedule_barangay_id,
    ct.team_id,
    ct.driver_id,
    ct.status as team_status,
    dr.id as route_id,
    dr.barangay_id as route_barangay_id
FROM collection_schedule cs
JOIN barangay b ON cs.barangay_id = b.barangay_id
JOIN collection_team ct ON cs.schedule_id = ct.schedule_id
LEFT JOIN daily_route dr ON dr.team_id = ct.team_id 
    AND DATE(dr.date) = DATE(cs.scheduled_date)
    AND dr.barangay_id = cs.barangay_id
WHERE cs.scheduled_date = '2025-11-21'
    AND ct.status IN ('accepted', 'confirmed', 'approved')
ORDER BY cs.start_time;



