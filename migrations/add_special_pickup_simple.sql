-- Simple migration to add special_pickup_id to collection_schedule
ALTER TABLE collection_schedule 
ADD COLUMN IF NOT EXISTS special_pickup_id INT NULL,
ADD INDEX IF NOT EXISTS idx_special_pickup (special_pickup_id);
