-- Check user roles to understand the data
SELECT 
    u.user_id,
    u.username,
    u.role_id,
    r.role_name
FROM user u
LEFT JOIN role r ON u.role_id = r.role_id
WHERE u.user_id IN (1, 3, 10, 16, 17, 28, 29, 30, 31, 32, 33, 34, 35, 36, 62, 86, 91, 93)
ORDER BY u.role_id, u.user_id;

-- Also check what role_ids exist in the system
SELECT role_id, role_name FROM role ORDER BY role_id;
