-- Migration: Create route_path_history table
-- Purpose: Store planned and actual route paths for visualization
-- Author: KolekTrash Team
-- Date: 2025-11-26

-- Create new table for route path tracking
CREATE TABLE IF NOT EXISTS route_path_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  route_id INT NOT NULL COMMENT 'References daily_route.id',
  truck_id INT NOT NULL COMMENT 'References truck.truck_id',
  latitude DECIMAL(10,8) NOT NULL COMMENT 'GPS latitude coordinate',
  longitude DECIMAL(11,8) NOT NULL COMMENT 'GPS longitude coordinate',
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When this point was recorded',
  is_planned BOOLEAN DEFAULT FALSE COMMENT 'TRUE for planned route, FALSE for actual path',
  sequence_order INT DEFAULT 0 COMMENT 'Order of points in the route',
  
  -- Indexes for performance
  INDEX idx_route_truck (route_id, truck_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_is_planned (is_planned),
  INDEX idx_sequence (route_id, sequence_order)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
COMMENT='Stores planned and actual route paths for map visualization';

-- Verify table creation
DESCRIBE route_path_history;

-- Show table info
SELECT 
    TABLE_NAME,
    ENGINE,
    TABLE_ROWS,
    CREATE_TIME,
    TABLE_COMMENT
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'kolektrash'
  AND TABLE_NAME = 'route_path_history';
