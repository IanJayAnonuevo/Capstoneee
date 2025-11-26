-- =====================================================
-- Schedule History Tracking Migration
-- =====================================================
-- This migration adds columns and tables to track
-- who created, edited, or deleted schedules
-- =====================================================

-- Step 1: Add tracking columns to predefined_schedules table
-- =====================================================

-- Add created_by column (tracks who created the schedule)
ALTER TABLE `predefined_schedules`
ADD COLUMN `created_by` INT(11) NULL DEFAULT NULL AFTER `is_active`,
ADD INDEX `idx_created_by` (`created_by`);

-- Add updated_by column (tracks who last updated the schedule)
ALTER TABLE `predefined_schedules`
ADD COLUMN `updated_by` INT(11) NULL DEFAULT NULL AFTER `created_by`,
ADD INDEX `idx_updated_by` (`updated_by`);

-- Add deleted_by column (tracks who deleted the schedule)
ALTER TABLE `predefined_schedules`
ADD COLUMN `deleted_by` INT(11) NULL DEFAULT NULL AFTER `updated_by`,
ADD INDEX `idx_deleted_by` (`deleted_by`);

-- Add deleted_at column (tracks when the schedule was deleted)
ALTER TABLE `predefined_schedules`
ADD COLUMN `deleted_at` TIMESTAMP NULL DEFAULT NULL AFTER `deleted_by`;

-- Add foreign key constraints
ALTER TABLE `predefined_schedules`
ADD CONSTRAINT `fk_predefined_schedules_created_by`
    FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT `fk_predefined_schedules_updated_by`
    FOREIGN KEY (`updated_by`) REFERENCES `user` (`user_id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT `fk_predefined_schedules_deleted_by`
    FOREIGN KEY (`deleted_by`) REFERENCES `user` (`user_id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 2: Create predefined_schedule_history table
-- =====================================================
-- This table stores a complete audit log of all schedule changes

CREATE TABLE IF NOT EXISTS `predefined_schedule_history` (
  `history_id` INT(11) NOT NULL AUTO_INCREMENT,
  `schedule_template_id` INT(11) NOT NULL,
  `action` ENUM('create', 'update', 'delete', 'restore') NOT NULL,
  `actor_user_id` INT(11) NOT NULL,
  `actor_role` VARCHAR(50) NULL DEFAULT NULL COMMENT 'Cached role name for quick display',
  `changed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `before_payload` JSON NULL DEFAULT NULL COMMENT 'Schedule data before the change',
  `after_payload` JSON NULL DEFAULT NULL COMMENT 'Schedule data after the change',
  `remarks` TEXT NULL DEFAULT NULL COMMENT 'Optional notes about the change',
  PRIMARY KEY (`history_id`),
  INDEX `idx_schedule_template_id` (`schedule_template_id`),
  INDEX `idx_actor_user_id` (`actor_user_id`),
  INDEX `idx_action` (`action`),
  INDEX `idx_changed_at` (`changed_at`),
  CONSTRAINT `fk_schedule_history_schedule`
    FOREIGN KEY (`schedule_template_id`) REFERENCES `predefined_schedules` (`schedule_template_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_schedule_history_actor`
    FOREIGN KEY (`actor_user_id`) REFERENCES `user` (`user_id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
COMMENT='Audit log for all predefined schedule changes';

-- =====================================================
-- Migration Complete
-- =====================================================
-- Next steps:
-- 1. Update API files to log history when schedules are created/updated/deleted
-- 2. Create API endpoint to retrieve schedule history
-- 3. Add History button to ManageSchedule.jsx frontend component
-- =====================================================

