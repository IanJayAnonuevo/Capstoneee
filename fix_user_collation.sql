-- Fix collations for user-related tables only
-- This script only fixes user, user_profile, and role tables
-- Simple approach: disable foreign key checks, convert, then re-enable

-- Step 1: Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Step 2: Convert user-related tables to utf8mb4_unicode_ci
-- Convert in order: role first (referenced by user), then user, then user_profile
ALTER TABLE role CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_profile CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 3: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Step 4: Verify the changes
SHOW TABLE STATUS WHERE Name IN ('user', 'user_profile', 'role');
