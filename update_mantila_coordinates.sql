-- Update Mantila coordinates in barangay table
-- Mantila is next to Impig (13.7884000, 122.9853000), using coordinates slightly offset
UPDATE barangay 
SET latitude = 13.7894000, 
    longitude = 122.9863000 
WHERE barangay_id = '30-MNTL' 
   OR barangay_name = 'Mantila';

-- Optional: Also update collection_point table if needed
UPDATE collection_point 
SET latitude = 13.7894000, 
    longitude = 122.9863000 
WHERE barangay_id = '30-MNTL' 
   OR location_name LIKE '%Mantila%';

