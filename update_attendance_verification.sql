-- Update attendance table to add verification fields
-- This allows personnel to record their own attendance and foreman to verify

ALTER TABLE `attendance` 
ADD COLUMN `verification_status` ENUM('pending', 'verified', 'rejected') DEFAULT 'pending' AFTER `status`,
ADD COLUMN `verified_by` INT(11) DEFAULT NULL AFTER `recorded_by`,
ADD COLUMN `verified_at` TIMESTAMP NULL DEFAULT NULL AFTER `verified_by`,
ADD COLUMN `verification_notes` TEXT DEFAULT NULL AFTER `verified_at`,
ADD KEY `idx_verification_status` (`verification_status`),
ADD CONSTRAINT `fk_attendance_verifier` FOREIGN KEY (`verified_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL;

-- Update existing records to 'verified' if they have recorded_by (foreman recorded)
UPDATE `attendance` 
SET `verification_status` = 'verified', 
    `verified_by` = `recorded_by`, 
    `verified_at` = `updated_at`
WHERE `recorded_by` IS NOT NULL;
