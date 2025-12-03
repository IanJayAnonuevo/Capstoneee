-- Check if there are trucks in the database
SELECT 
    truck_id,
    plate_num,
    capacity,
    truck_type,
    status,
    created_at
FROM truck
ORDER BY truck_id;

-- If no trucks exist, insert sample trucks
-- Uncomment the lines below to add sample trucks:

/*
INSERT INTO truck (plate_num, capacity, truck_type, status) VALUES
('ABC-1234', 5.0, 'Compactor', 'available'),
('XYZ-5678', 3.5, 'Standard', 'available'),
('DEF-9012', 4.0, 'Compactor', 'maintenance');
*/
