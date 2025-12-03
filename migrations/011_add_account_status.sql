-- Migration: Add account_status field to user table
-- This allows admins to suspend/activate user accounts

ALTER TABLE `user` 
ADD COLUMN `account_status` ENUM('active', 'suspended') NOT NULL DEFAULT 'active' 
AFTER `online_status`;

-- Update existing users to have active status
UPDATE `user` SET `account_status` = 'active' WHERE `account_status` IS NULL;
