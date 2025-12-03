-- Add special_pickup_id column to collection_schedule table
-- This allows linking special pickup requests to scheduled collections

-- Check if column exists and add if not
SET @dbname = DATABASE();
SET @tablename = 'collection_schedule';
SET @columnname = 'special_pickup_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL, ADD INDEX idx_special_pickup (', @columnname, ')')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
