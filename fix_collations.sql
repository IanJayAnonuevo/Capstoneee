-- Fix collations for all related tables to be consistent
-- This script drops foreign keys, converts tables, then re-adds foreign keys
-- Run these commands in phpMyAdmin or MySQL command line
-- NOTE: If a constraint doesn't exist, that command will fail but you can continue

-- Step 1: Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Step 2: Drop foreign key constraints (run these one by one, ignore errors for non-existent constraints)
-- Drop from collection_point
ALTER TABLE collection_point DROP FOREIGN KEY collection_point_ibfk_1;

-- Drop from collection_schedule  
ALTER TABLE collection_schedule DROP FOREIGN KEY collection_schedule_ibfk_1;
ALTER TABLE collection_schedule DROP FOREIGN KEY collection_schedule_ibfk_2;
ALTER TABLE collection_schedule DROP FOREIGN KEY collection_schedule_ibfk_3;

-- Drop from predefined_schedules
ALTER TABLE predefined_schedules DROP FOREIGN KEY predefined_schedules_ibfk_1;
ALTER TABLE predefined_schedules DROP FOREIGN KEY predefined_schedules_ibfk_2;

-- Drop from user_profile (if exists - ignore error if it doesn't)
ALTER TABLE user_profile DROP FOREIGN KEY user_profile_ibfk_1;
ALTER TABLE user_profile DROP FOREIGN KEY user_profile_ibfk_2;

-- Drop from barangay
ALTER TABLE barangay DROP FOREIGN KEY barangay_ibfk_1;
ALTER TABLE barangay DROP FOREIGN KEY barangay_ibfk_2;

-- Drop from collection_team
ALTER TABLE collection_team DROP FOREIGN KEY collection_team_ibfk_1;
ALTER TABLE collection_team DROP FOREIGN KEY collection_team_ibfk_2;
ALTER TABLE collection_team DROP FOREIGN KEY collection_team_ibfk_3;

-- Drop from collection_team_member
ALTER TABLE collection_team_member DROP FOREIGN KEY collection_team_member_ibfk_1;
ALTER TABLE collection_team_member DROP FOREIGN KEY collection_team_member_ibfk_2;

-- Step 3: Convert all tables to utf8mb4_unicode_ci
-- Convert referenced tables first, then dependent tables
ALTER TABLE cluster CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE barangay_head CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE role CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE barangay CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE collection_type CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_profile CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE truck CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE collection_schedule CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE collection_team CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE collection_team_member CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE daily_route CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE collection_point CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE predefined_schedules CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 4: Re-add foreign key constraints
ALTER TABLE barangay 
  ADD CONSTRAINT barangay_ibfk_1 FOREIGN KEY (cluster_id) REFERENCES cluster (cluster_id),
  ADD CONSTRAINT barangay_ibfk_2 FOREIGN KEY (barangay_head_id) REFERENCES barangay_head (user_id);

ALTER TABLE collection_point 
  ADD CONSTRAINT collection_point_ibfk_1 FOREIGN KEY (barangay_id) REFERENCES barangay (barangay_id);

ALTER TABLE collection_schedule 
  ADD CONSTRAINT collection_schedule_ibfk_1 FOREIGN KEY (barangay_id) REFERENCES barangay (barangay_id),
  ADD CONSTRAINT collection_schedule_ibfk_2 FOREIGN KEY (type_id) REFERENCES collection_type (type_id),
  ADD CONSTRAINT collection_schedule_ibfk_3 FOREIGN KEY (created_by) REFERENCES user (user_id);

ALTER TABLE predefined_schedules 
  ADD CONSTRAINT predefined_schedules_ibfk_1 FOREIGN KEY (barangay_id) REFERENCES barangay (barangay_id),
  ADD CONSTRAINT predefined_schedules_ibfk_2 FOREIGN KEY (cluster_id) REFERENCES cluster (cluster_id);

ALTER TABLE collection_team 
  ADD CONSTRAINT collection_team_ibfk_1 FOREIGN KEY (schedule_id) REFERENCES collection_schedule (schedule_id),
  ADD CONSTRAINT collection_team_ibfk_2 FOREIGN KEY (truck_id) REFERENCES truck (truck_id),
  ADD CONSTRAINT collection_team_ibfk_3 FOREIGN KEY (driver_id) REFERENCES user (user_id);

ALTER TABLE collection_team_member 
  ADD CONSTRAINT collection_team_member_ibfk_1 FOREIGN KEY (team_id) REFERENCES collection_team (team_id),
  ADD CONSTRAINT collection_team_member_ibfk_2 FOREIGN KEY (collector_id) REFERENCES user (user_id);

-- Re-add constraints to user_profile
ALTER TABLE user_profile 
  ADD CONSTRAINT user_profile_ibfk_1 FOREIGN KEY (user_id) REFERENCES user (user_id),
  ADD CONSTRAINT user_profile_ibfk_2 FOREIGN KEY (barangay_id) REFERENCES barangay (barangay_id);

-- Step 5: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Step 6: Verify the changes
SHOW TABLE STATUS WHERE Name IN ('collection_team', 'collection_schedule', 'collection_team_member', 'barangay', 'daily_route', 'truck', 'user', 'user_profile', 'role', 'collection_point');
