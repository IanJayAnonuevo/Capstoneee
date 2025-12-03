-- Add Task Assignment Data for Active Staff Count
-- Using the actual task_assignment table structure

-- Insert sample task assignments for drivers and collectors
-- Based on the table structure: team_id, schedule_id, truck_id, driver_id, session, attendance_snapshot, status

INSERT INTO task_assignment (team_id, driver_id, status)
VALUES
-- Drivers (role_id = 3): user_ids 16, 17, 62
(1, 16, 'in_progress'),
(2, 17, 'in_progress'),
(3, 62, 'pending'),

-- Collectors (role_id = 4): user_ids 28, 29, 30, 31, 32, 33, 34, 35, 36, 86
(4, 28, 'in_progress'),
(5, 29, 'in_progress'),
(6, 30, 'in_progress'),
(7, 31, 'in_progress'),
(8, 32, 'in_progress'),
(9, 33, 'pending'),
(10, 34, 'pending'),
(11, 35, 'completed'),
(12, 36, 'completed'),
(13, 86, 'in_progress');

-- Verification
SELECT 
    'Task assignments created' as item,
    COUNT(*) as count 
FROM task_assignment ta
INNER JOIN user u ON ta.driver_id = u.user_id
WHERE ta.status IN ('pending', 'in_progress', 'completed')
AND u.role_id IN (3, 4);

SELECT 
    'Drivers assigned' as item,
    COUNT(DISTINCT ta.driver_id) as count 
FROM task_assignment ta
INNER JOIN user u ON ta.driver_id = u.user_id
WHERE ta.status IN ('pending', 'in_progress', 'completed')
AND u.role_id = 3

UNION ALL

SELECT 
    'Collectors assigned' as item,
    COUNT(DISTINCT ta.driver_id) as count 
FROM task_assignment ta
INNER JOIN user u ON ta.driver_id = u.user_id
WHERE ta.status IN ('pending', 'in_progress', 'completed')
AND u.role_id = 4;

SELECT 'Task assignment data inserted successfully!' as message;
