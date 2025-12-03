-- Add Attendance for Drivers and Collectors ONLY
-- Using users with role_id 3 (Drivers) and role_id 4 (Collectors)

-- Clear existing attendance for today
DELETE FROM attendance_request WHERE DATE(submitted_at) = '2025-11-28';

-- Insert attendance records for DRIVERS (role_id = 3)
-- user_ids: 16, 17, 62
INSERT INTO attendance_request (user_id, submitted_at, request_status, remarks)
VALUES
(16, '2025-11-28 06:45:00', 'approved', 'Driver time-in'),
(17, '2025-11-28 06:46:00', 'approved', 'Driver time-in'),
(62, '2025-11-28 06:47:00', 'approved', 'Driver time-in');

-- Insert attendance records for COLLECTORS (role_id = 4)
-- user_ids: 28, 29, 30, 31, 32, 33, 34, 35, 36, 86
INSERT INTO attendance_request (user_id, submitted_at, request_status, remarks)
VALUES
(28, '2025-11-28 06:48:00', 'approved', 'Collector time-in'),
(29, '2025-11-28 06:49:00', 'approved', 'Collector time-in'),
(30, '2025-11-28 06:50:00', 'approved', 'Collector time-in'),
(31, '2025-11-28 06:51:00', 'approved', 'Collector time-in'),
(32, '2025-11-28 06:52:00', 'approved', 'Collector time-in'),
(33, '2025-11-28 06:53:00', 'approved', 'Collector time-in'),
(34, '2025-11-28 06:54:00', 'approved', 'Collector time-in'),
(35, '2025-11-28 06:55:00', 'approved', 'Collector time-in'),
(36, '2025-11-28 06:56:00', 'approved', 'Collector time-in'),
(86, '2025-11-28 06:57:00', 'approved', 'Collector time-in');

-- Set 2 users as "On Leave" (using collectors)
UPDATE user SET status = 'On Leave' WHERE user_id IN (35, 36);

-- Verification
SELECT 
    'Attendance records (role 3 & 4)' as item,
    COUNT(*) as count 
FROM attendance_request ar
INNER JOIN user u ON ar.user_id = u.user_id
WHERE DATE(ar.submitted_at) = '2025-11-28'
AND ar.request_status = 'approved'
AND u.role_id IN (3, 4)

UNION ALL

SELECT 
    'Users on leave (role 3 & 4)' as item,
    COUNT(*) as count 
FROM user 
WHERE status = 'On Leave'
AND role_id IN (3, 4);

SELECT 'Attendance data inserted successfully!' as message;
