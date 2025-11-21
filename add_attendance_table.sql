-- Create attendance table for personnel tracking
-- This table stores attendance records for truck drivers and garbage collectors

CREATE TABLE IF NOT EXISTS `attendance` (
  `attendance_id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `attendance_date` DATE NOT NULL,
  `session` ENUM('AM', 'PM') NOT NULL,
  `time_in` TIME DEFAULT NULL,
  `time_out` TIME DEFAULT NULL,
  `status` ENUM('present', 'absent', 'on-leave', 'pending') DEFAULT 'pending',
  `verification_status` ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  `recorded_by` INT(11) DEFAULT NULL COMMENT 'Foreman user_id who recorded attendance',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`attendance_id`),
  UNIQUE KEY `unique_attendance` (`user_id`, `attendance_date`, `session`),
  KEY `idx_user_date` (`user_id`, `attendance_date`),
  KEY `idx_date` (`attendance_date`),
  KEY `idx_recorded_by` (`recorded_by`),
  KEY `idx_verification_status` (`verification_status`),
  CONSTRAINT `fk_attendance_user_ref` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attendance_recorder_ref` FOREIGN KEY (`recorded_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add index for better performance
CREATE INDEX `idx_status` ON `attendance` (`status`);
CREATE INDEX `idx_session` ON `attendance` (`session`);
