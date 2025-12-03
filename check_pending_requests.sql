-- Check for pending attendance requests for user_id 38 today
SELECT * FROM attendance_request 
WHERE user_id = 38 
  AND DATE(submitted_at) = '2025-11-28'
ORDER BY submitted_at DESC;
