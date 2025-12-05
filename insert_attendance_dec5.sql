-- Simple SQL to insert attendance for December 5, 2025
-- Run this in phpMyAdmin or MySQL Workbench

-- First, check what users exist
SELECT user_id, username, user_role FROM user WHERE user_role IN ('driver', 'collector') LIMIT 5;

-- Insert attendance records (adjust user_id values based on above query)
-- Example: Insert for user_id 1, 2, 3 (replace with actual user IDs)

INSERT INTO attendance (user_id, attendance_date, session, time_in, time_out, status, verification_status, created_at)
VALUES 
-- User 1: AM session with time-out (completed)
(1, '2025-12-05', 'AM', '2025-12-05 05:30:00', '2025-12-05 12:00:00', 'present', 'verified', NOW()),

-- User 2: PM session with time-out (completed)
(2, '2025-12-05', 'PM', '2025-12-05 13:15:00', '2025-12-05 17:30:00', 'present', 'verified', NOW()),

-- User 3: AM session without time-out (in progress)
(3, '2025-12-05', 'AM', '2025-12-05 05:45:00', NULL, 'present', 'verified', NOW())

ON DUPLICATE KEY UPDATE
    time_in = VALUES(time_in),
    time_out = VALUES(time_out),
    status = VALUES(status),
    verification_status = VALUES(verification_status);

-- Verify the records
SELECT a.*, u.username 
FROM attendance a
JOIN user u ON a.user_id = u.user_id
WHERE a.attendance_date = '2025-12-05'
ORDER BY a.session, a.user_id;
