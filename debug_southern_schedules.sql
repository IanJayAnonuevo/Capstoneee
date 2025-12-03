-- Check predefined schedules for Southern Barangays
SELECT 
    ps.id,
    b.barangay_name,
    ps.day_of_week,
    ps.week_of_month,
    ps.schedule_type,
    ps.cluster_id,
    ps.start_time,
    ps.end_time,
    ps.session,
    ps.is_active,
    CASE 
        WHEN ps.start_time >= '12:00:00' THEN 'PM'
        ELSE 'AM'
    END as inferred_session
FROM predefined_schedules ps
JOIN barangay b ON ps.barangay_id = b.barangay_id
WHERE b.barangay_name IN ('Anib', 'San Vicente', 'Malaguico')
ORDER BY ps.day_of_week, ps.start_time;

-- Also check what schedules match November 30, 2025 (Sunday, Week 5)
SELECT 
    ps.id,
    b.barangay_name,
    ps.day_of_week,
    ps.week_of_month,
    ps.schedule_type,
    ps.cluster_id,
    ps.start_time,
    ps.end_time,
    ps.session,
    ps.is_active,
    CASE 
        WHEN ps.day_of_week = 'Sunday' THEN 'MATCHES Nov 30'
        ELSE 'Does not match'
    END as matches_nov_30,
    CASE 
        WHEN ps.week_of_month IS NULL THEN 'Any week'
        WHEN ps.week_of_month = 5 THEN 'Week 5 (Nov 30)'
        ELSE CONCAT('Week ', ps.week_of_month, ' only')
    END as week_match
FROM predefined_schedules ps
JOIN barangay b ON ps.barangay_id = b.barangay_id
WHERE ps.day_of_week = 'Sunday'
AND ps.is_active = 1
ORDER BY ps.start_time, b.barangay_name;
