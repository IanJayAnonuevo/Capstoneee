-- Migration: Add Soft Delete Support to User Table
-- This allows "deleting" users without actually removing them from the database
-- Deleted users will have a timestamp in the deleted_at field

-- Add deleted_at column to user table
ALTER TABLE `user` 
ADD COLUMN `deleted_at` DATETIME NULL DEFAULT NULL COMMENT 'Timestamp when user was soft-deleted';

-- Add deleted_by column to track who deleted the user
ALTER TABLE `user` 
ADD COLUMN `deleted_by` INT(11) NULL DEFAULT NULL COMMENT 'User ID of admin who deleted this user';

-- Add foreign key for deleted_by (optional, can be NULL if deleting user is also deleted)
ALTER TABLE `user`
ADD CONSTRAINT `fk_user_deleted_by` 
FOREIGN KEY (`deleted_by`) REFERENCES `user` (`user_id`) 
ON DELETE SET NULL;

-- Create index for faster queries on deleted_at
CREATE INDEX `idx_user_deleted_at` ON `user` (`deleted_at`);

-- Verify the changes
DESCRIBE `user`;

SELECT 'Soft delete migration completed successfully!' as message;
