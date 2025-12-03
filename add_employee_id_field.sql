-- Add employee_id field to user_profile table for unique ID verification
-- This field will store each personnel's unique employee identifier

ALTER TABLE user_profile 
ADD COLUMN employee_id VARCHAR(50) NULL AFTER user_id;

-- Add unique constraint to ensure no duplicate employee IDs
ALTER TABLE user_profile 
ADD UNIQUE KEY unique_employee_id (employee_id);

-- Add comment for documentation
ALTER TABLE user_profile 
MODIFY COLUMN employee_id VARCHAR(50) NULL COMMENT 'Unique employee identifier for personnel verification';
