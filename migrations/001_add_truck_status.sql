-- Migration: Add truck status and route tracking to gps_route_log
-- Purpose: Enable color-coded truck markers and route association
-- Author: KolekTrash Team
-- Date: 2025-11-26

-- Add truck_status column for color coding
-- Values: 'idle' (🔴 Red), 'moving' (🟢 Green), 'full_load' (🟡 Yellow)
ALTER TABLE gps_route_log 
ADD COLUMN truck_status ENUM('idle', 'moving', 'full_load') DEFAULT 'idle' 
COMMENT 'Truck operational status for color-coded markers'
AFTER heading;

-- Add route_id to link GPS logs with specific routes
ALTER TABLE gps_route_log 
ADD COLUMN route_id INT DEFAULT NULL 
COMMENT 'Links GPS log to daily_route table'
AFTER truck_status;

-- Add index for faster route queries
ALTER TABLE gps_route_log 
ADD INDEX idx_route_id (route_id);

-- Add index for status filtering
ALTER TABLE gps_route_log 
ADD INDEX idx_truck_status (truck_status);

-- Verify changes
SELECT 
    COLUMN_NAME, 
    COLUMN_TYPE, 
    COLUMN_DEFAULT, 
    COLUMN_COMMENT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'kolektrash' 
  AND TABLE_NAME = 'gps_route_log'
  AND COLUMN_NAME IN ('truck_status', 'route_id');
