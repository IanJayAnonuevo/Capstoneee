-- Add employment_type field to user_profile table
-- This field will distinguish between regular and job order personnel

ALTER TABLE user_profile 
ADD COLUMN employment_type ENUM('regular', 'job_order') DEFAULT 'job_order' AFTER employee_id;

-- Add index for faster queries
ALTER TABLE user_profile 
ADD INDEX idx_employment_type (employment_type);

-- Add comment for documentation
ALTER TABLE user_profile 
MODIFY COLUMN employment_type ENUM('regular', 'job_order') DEFAULT 'job_order' 
COMMENT 'Employment type: regular (permanent) or job_order (temporary/contractual)';

-- Update existing records with employee_id to be regular
UPDATE user_profile 
SET employment_type = 'regular' 
WHERE employee_id IS NOT NULL AND employee_id != '';

-- Show results
SELECT 
    u.user_id,
    u.username,
    CONCAT(up.firstname, ' ', up.lastname) AS full_name,
    up.employee_id,
    up.employment_type,
    r.role_name
FROM user u
LEFT JOIN user_profile up ON u.user_id = up.user_id
LEFT JOIN role r ON u.role_id = r.role_id
WHERE u.role_id IN (3, 4)
ORDER BY up.employment_type, up.firstname;
