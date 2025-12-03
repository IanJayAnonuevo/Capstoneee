-- Check collection_team entries for December 01, 2025
SELECT 
    ct.team_id,
    cs.scheduled_date,
    cs.start_time,
    u.username as driver_name,
    ct.driver_id,
    ct.status as team_status,
    b.barangay_name
FROM collection_team ct
LEFT JOIN collection_schedule cs ON ct.schedule_id = cs.schedule_id
LEFT JOIN user u ON ct.driver_id = u.user_id
LEFT JOIN barangay b ON cs.barangay_id = b.barangay_id
WHERE cs.scheduled_date = '2025-12-01'
ORDER BY cs.start_time;

-- Check collectors for those teams
SELECT 
    ctm.team_id,
    u.username as collector_name,
    ctm.collector_id,
    ctm.response_status
FROM collection_team_member ctm
JOIN user u ON ctm.collector_id = u.user_id
WHERE ctm.team_id IN (
    SELECT ct.team_id 
    FROM collection_team ct
    LEFT JOIN collection_schedule cs ON ct.schedule_id = cs.schedule_id
    WHERE cs.scheduled_date = '2025-12-01'
)
ORDER BY ctm.team_id;

-- Check daily_route for December 01, 2025
SELECT 
    dr.id,
    dr.team_id,
    dr.date,
    dr.status as route_status,
    dr.start_time,
    dr.end_time,
    dr.cluster_id,
    dr.barangay_name
FROM daily_route dr
WHERE dr.date = '2025-12-01'
ORDER BY dr.start_time;

-- Full combined query (same as API)
SELECT 
    ct.team_id as assignment_id,
    ct.schedule_id,
    ct.truck_id,
    ct.driver_id,
    ct.status,
    cs.scheduled_date as date,
    cs.start_time as time,
    cs.barangay_id,
    b.barangay_name,
    t.plate_num as truck_plate,
    u.username as driver_name,
    dr.id as route_id,
    dr.status as route_status
FROM collection_team ct
LEFT JOIN collection_schedule cs ON ct.schedule_id = cs.schedule_id
LEFT JOIN barangay b ON cs.barangay_id = b.barangay_id
LEFT JOIN truck t ON ct.truck_id = t.truck_id
LEFT JOIN user u ON ct.driver_id = u.user_id
LEFT JOIN daily_route dr ON ct.team_id = dr.team_id AND cs.scheduled_date = dr.date
WHERE cs.scheduled_date = '2025-12-01'
ORDER BY cs.start_time;
