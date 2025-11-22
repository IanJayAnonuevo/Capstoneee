-- Check if daily_route records exist for the schedules
-- Run this to see if routes are generated

-- Check routes for today
SELECT 
    dr.id as route_id,
    dr.date,
    dr.barangay_name,
    dr.barangay_id,
    dr.team_id,
    ct.driver_id,
    cs.scheduled_date,
    cs.barangay_id as schedule_barangay_id
FROM daily_route dr
LEFT JOIN collection_team ct ON dr.team_id = ct.team_id
LEFT JOIN collection_schedule cs ON ct.schedule_id = cs.schedule_id
WHERE dr.date = CURDATE()
ORDER BY dr.date, dr.start_time;

-- Check if there are schedules without routes
SELECT 
    cs.schedule_id,
    cs.scheduled_date,
    b.barangay_name,
    ct.team_id,
    ct.driver_id,
    dr.id as route_id
FROM collection_schedule cs
JOIN barangay b ON cs.barangay_id = b.barangay_id
JOIN collection_team ct ON cs.schedule_id = ct.schedule_id
LEFT JOIN daily_route dr ON dr.team_id = ct.team_id 
    AND DATE(dr.date) = DATE(cs.scheduled_date)
    AND dr.barangay_id = cs.barangay_id
WHERE cs.scheduled_date = CURDATE()
    AND ct.status IN ('accepted', 'confirmed', 'approved')
    AND dr.id IS NULL;



