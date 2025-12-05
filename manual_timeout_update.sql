-- Direct SQL to manually set time_out for completed tasks
-- Run this in phpMyAdmin to manually add time-out for Paul and Alvin

-- Update Paul Ezra Bermal (user_id 16) - AM session
UPDATE attendance 
SET time_out = '2025-12-05 12:00:00',
    verification_status = 'verified',
    status = 'present',
    notes = 'Auto-timeout - all tasks completed',
    updated_at = NOW()
WHERE user_id = 16 
AND attendance_date = '2025-12-05' 
AND session = 'AM';

-- Update Alvin Monida (user_id 30) - AM session  
UPDATE attendance 
SET time_out = '2025-12-05 12:00:00',
    verification_status = 'verified',
    status = 'present',
    notes = 'Auto-timeout - all tasks completed',
    updated_at = NOW()
WHERE user_id = 30 
AND attendance_date = '2025-12-05' 
AND session = 'AM';

-- Verify the updates
SELECT a.*, u.username 
FROM attendance a
JOIN user u ON a.user_id = u.user_id
WHERE a.attendance_date = '2025-12-05'
AND a.user_id IN (16, 30)
ORDER BY a.session, a.user_id;
