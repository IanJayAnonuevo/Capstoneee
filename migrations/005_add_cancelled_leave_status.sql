-- Add 'cancelled' status to leave_request table
-- This allows users to cancel their approved leave requests

ALTER TABLE `leave_request` 
MODIFY COLUMN `request_status` ENUM('pending', 'approved', 'declined', 'cancelled') 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending';
