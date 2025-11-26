-- Migration: Add status tracking to collection_point
-- Purpose: Enable pending/completed status for collection points with geofencing
-- Author: KolekTrash Team
-- Date: 2025-11-26

-- Add status column for tracking collection completion
-- Values: 'pending' (🗑️ Red bin), 'completed' (✅ Green checkmark)
ALTER TABLE collection_point 
ADD COLUMN status ENUM('pending', 'completed') DEFAULT 'pending' 
COMMENT 'Collection status: pending or completed'
AFTER is_mrf;

-- Add timestamp for last collection
ALTER TABLE collection_point 
ADD COLUMN last_collected DATETIME DEFAULT NULL 
COMMENT 'Timestamp when collection was last completed'
AFTER status;

-- Add geofence radius for automatic status updates
ALTER TABLE collection_point 
ADD COLUMN geofence_radius INT DEFAULT 50 
COMMENT 'Radius in meters for automatic collection detection'
AFTER last_collected;

-- Add index for status filtering
ALTER TABLE collection_point 
ADD INDEX idx_status (status);

-- Add index for date-based queries
ALTER TABLE collection_point 
ADD INDEX idx_last_collected (last_collected);

-- Verify changes
SELECT 
    COLUMN_NAME, 
    COLUMN_TYPE, 
    COLUMN_DEFAULT, 
    COLUMN_COMMENT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'kolektrash' 
  AND TABLE_NAME = 'collection_point'
  AND COLUMN_NAME IN ('status', 'last_collected', 'geofence_radius');
