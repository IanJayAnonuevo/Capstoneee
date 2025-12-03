-- Check your attendance records for today
-- Replace YOUR_USER_ID with your actual user_id

SELECT 
    a.attendance_id,
    a.user_id,
    a.attendance_date,
    a.session,
    a.time_in,
    a.time_out,
    a.status,
    a.verification_status,
    a.recorded_by,
    a.notes,
    a.created_at,
    a.updated_at
FROM attendance a
WHERE a.user_id = YOUR_USER_ID
  AND a.attendance_date = CURDATE()
ORDER BY a.session, a.created_at;

-- Also check pending attendance requests
SELECT 
    ar.id,
    ar.user_id,
    ar.schedule_id,
    ar.photo_path,
    ar.remarks,
    ar.submitted_at,
    ar.request_status
FROM attendance_request ar
WHERE ar.user_id = YOUR_USER_ID
  AND DATE(ar.submitted_at) = CURDATE()
ORDER BY ar.submitted_at DESC;
